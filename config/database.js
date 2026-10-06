import mongoose from "mongoose"
const databaseConnction = async () => {
    try {
        const conection = await mongoose.connect(process.env.MONGODB_URI);
        console.log("conection successfull")
    }
    catch (error) {
        console.log(error)
    }
}

export default databaseConnction