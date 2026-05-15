const asyncHandler = (requestHandler) => {
    return (req,res,next)=>{
        Promise.resolve(
            requestHandler(req,res,next)
        ).catch((err)=>{
            next(err)
        })
    }
}

export {asyncHandler}

// try catch way

// const asyncHandler =  (requestHandler) => async (req,res,next) => {
//     try {
//         await requestHandler(req,res,next)
//     } catch (err) {
//         res.status(err.code || 500).json({
//             message : err.message,
//             sucess : false
//         })
//     }
// }