import { Stack } from 'expo-router'

const IndexLayout = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="create-restaurant" />
            <Stack.Screen name="edit-restaurant" />
        </Stack>
    )
}

export default IndexLayout