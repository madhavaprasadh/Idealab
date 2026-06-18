import generateresponse from "../services/aiservice.js"

export const chat = async(req,res)=>{
    const {messages}=req.body
    if(!messages){
        return res.json({
            success:false,
            message:"messages are required"
        })
    }
    try{
        const response = await generateresponse(messages)
        let completed = false;
        try {
            const idea = JSON.parse(response.response);

            if (
                idea.product_name &&
                idea.problem &&
                idea.target_users &&
                idea.business_model &&
                idea.features
            ) {
                completed = true;
            }
        }
        catch (error) {
            completed = false;  
        }
        return res.json({
            success:true,
            response,
            completed
        })
    }
    catch(error){
        console.log(error)
        return res.json({
            success:false,
            message:error.message
        })
    }
}