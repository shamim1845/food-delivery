import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { desc, eq, inArray, SQL } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import { OrderStatus, UserRole } from '@food-delivery/types';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersGateway } from '../gateway/orders.gateway';
import { DriverService } from '../driver/driver.service';

@Injectable()
export class OrdersService {
  constructor(
    @Inject('DB') private db: NeonHttpDatabase<typeof schema>,
    private ordersGateway: OrdersGateway,
    private driverService: DriverService,
  ) {}

  async create(customerId: string, dto: CreateOrderDto) {
    const menuItemIds = dto.items.map((i) => i.menuItemId);

    // fetch all menu items in one query
    const menuItems = await this.db
      .select()
      .from(schema.menuItems)
      .where(inArray(schema.menuItems.id, menuItemIds));

    // verify all menu item IDs were actually found in the DB
    // if any ID is invalid, menuItems.length < dto.items.length
    // without this check, find() returns undefined and total becomes NaN
    if (menuItems.length !== dto.items.length) {
      throw new BadRequestException('One or more menu items not found');
    }

    // verify all items belong to the specified restaurant
    const allBelongToRestaurant = menuItems.every(
      (item) => item.restaurantId === dto.restaurantId,
    );

    if (!allBelongToRestaurant) {
      throw new BadRequestException(
        'All items must belong to the same restaurant',
      );
    }

    // calculate total server-side — never trust the client's price
    const total = dto.items.reduce((sum, orderItem) => {
      const menuItem = menuItems.find((m) => m.id === orderItem.menuItemId);
      if (!menuItem) return sum;
      return sum + parseFloat(menuItem.price) * parseInt(orderItem.quantity);
    }, 0);

    // insert the order
    const [order] = await this.db
      .insert(schema.orders)
      .values({
        customerId,
        restaurantId: dto.restaurantId,
        deliveryAddress: dto.deliveryAddress,
        totalAmount: total.toFixed(2),
        status: 'PENDING',
      })
      .returning();

    // insert all order items
    await this.db.insert(schema.orderItems).values(
      dto.items.map((item) => {
        const menuItem = menuItems.find((m) => m.id === item.menuItemId)!;
        return {
          orderId: order.id,
          menuItemId: item.menuItemId,
          quantity: Number(item.quantity),
          unitPrice: menuItem.price, // snapshot the price at time of order
        };
      }),
    );

    return order;
  }

  async findByCustomer(customerId: string) {
    return this.findOrdersWithDetails(eq(schema.orders.customerId, customerId));
  }

  async findByDriver(driverId: string) {
    return this.findOrdersWithDetails(eq(schema.orders.driverId, driverId));
  }

  // routes to customer or driver query based on JWT role
  async findMyOrders(userId: string, role: string) {
    if (role === UserRole.DRIVER) {
      return this.findByDriver(userId);
    }
    return this.findByCustomer(userId);
  }

  async findById(id: string, user: { sub: string; role: string }) {
    const [order] = await this.db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, id));

    if (!order) throw new NotFoundException('Order not found');

    // check access by role — each role can only view orders they're involved in
    // we use the same NotFoundException message regardless — avoids leaking whether the order exists
    const canView =
      (user.role === UserRole.CUSTOMER && order.customerId === user.sub) ||
      (user.role === UserRole.RESTAURANT_OWNER &&
        (await this.isOwnerOfRestaurant(user.sub, order.restaurantId))) ||
      (user.role === UserRole.DRIVER && order.driverId === user.sub);

    if (!canView) throw new NotFoundException('Order not found');

    const items = await this.db
      .select()
      .from(schema.orderItems)
      .where(eq(schema.orderItems.orderId, id));

    return { ...order, items };
  }

  async findByRestaurant(ownerId: string) {
    const [restaurant] = await this.db
      .select()
      .from(schema.restaurants)
      .where(eq(schema.restaurants.ownerId, ownerId));

    if (!restaurant) throw new NotFoundException('Restaurant not found');

    return this.findOrdersWithDetails(
      eq(schema.orders.restaurantId, restaurant.id),
    );
  }

  async updateStatus(
    orderId: string,
    newStatus: OrderStatus,
    user: { sub: string; role: string },
  ) {
    const [order] = await this.db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId));

    if (!order) throw new NotFoundException('Order not found');

    this.validateTransition(order.status, newStatus, user.role);

    if (user.role === UserRole.RESTAURANT_OWNER) {
      const [restaurant] = await this.db
        .select()
        .from(schema.restaurants)
        .where(eq(schema.restaurants.ownerId, user.sub));

      if (!restaurant || restaurant.id !== order.restaurantId) {
        throw new ForbiddenException(
          'This order does not belong to your restaurant',
        );
      }
    }

    if (user.role === UserRole.DRIVER && order.driverId !== user.sub) {
      throw new ForbiddenException('This order is not assigned to you');
    }

    const [updated] = await this.db
      .update(schema.orders)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(schema.orders.id, orderId))
      .returning();

    this.ordersGateway.emitOrderUpdate(updated);

    if (newStatus === 'READY') {
      await this.driverService.assignDriver(orderId);
    }

    return updated;
  }

  private validateTransition(
    currentStatus: string,
    newStatus: string,
    role: string,
  ) {
    const ownerTransitions: Record<string, string[]> = {
      CONFIRMED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY', 'CANCELLED'],
    };

    const driverTransitions: Record<string, string[]> = {
      READY: ['PICKED_UP'],
      PICKED_UP: ['DELIVERED'],
    };

    const allowed =
      role === UserRole.RESTAURANT_OWNER
        ? (ownerTransitions[currentStatus] ?? [])
        : role === UserRole.DRIVER
          ? (driverTransitions[currentStatus] ?? [])
          : [];

    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  private async isOwnerOfRestaurant(ownerId: string, restaurantId: string) {
    // one restaurant per owner — single query is enough
    const [restaurant] = await this.db
      .select()
      .from(schema.restaurants)
      .where(eq(schema.restaurants.ownerId, ownerId));

    return restaurant?.id === restaurantId;
  }

  private async enrichOrders(orderRows: (typeof schema.orders.$inferSelect)[]) {
    if (orderRows.length === 0) return [];

    const orderIds = orderRows.map((o) => o.id);
    const restaurantIds = [...new Set(orderRows.map((o) => o.restaurantId))];

    const restaurants = await this.db
      .select({
        id: schema.restaurants.id,
        name: schema.restaurants.name,
      })
      .from(schema.restaurants)
      .where(inArray(schema.restaurants.id, restaurantIds));

    const items = await this.db
      .select()
      .from(schema.orderItems)
      .where(inArray(schema.orderItems.orderId, orderIds));

    const restaurantMap = Object.fromEntries(restaurants.map((r) => [r.id, r]));

    return orderRows.map((order) => ({
      ...order,
      restaurant: restaurantMap[order.restaurantId],
      items: items.filter((i) => i.orderId === order.id),
    }));
  }

  // shared fetch: filter orders, sort newest first, enrich with relations
  private async findOrdersWithDetails(where: SQL) {
    const orderRows = await this.db
      .select()
      .from(schema.orders)
      .where(where)
      .orderBy(desc(schema.orders.createdAt));

    return this.enrichOrders(orderRows);
  }
}
