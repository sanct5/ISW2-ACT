import mongoose from "mongoose"

export const startConnection = async () => {
    const url = encodeURI("mongodb+srv://santiagocampino:gORPeCarETqkTdJC@practice.lh0kqgz.mongodb.net/?retryWrites=true&w=majority")
    await mongoose.connect(url);
}