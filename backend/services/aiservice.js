import axios from "axios";
const generateresponse = async (messages) => {
    try {
        const url = process.env.AI_SERVER + "/generate";
        console.log("URL =", url);
        const response = await axios.post(
            url,
            { messages },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;

    } catch(error) {
        console.log("FULL ERROR:");
        console.log(error);
        if (error.response) {
            console.log(error.response.data);
        }
        throw error;
    }
};

export default generateresponse;