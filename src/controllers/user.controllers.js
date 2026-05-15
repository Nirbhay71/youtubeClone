import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponce.js"
import bcrypt from "bcrypt"

const generateAccessTokenAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accesstoken = user.generateAccessToken();
        const refreshtoken = user.generateRefreshToken();
        user.refreshToken = refreshtoken;
        await user.save({validateBeforeSave : false})
        return {
            accesstoken, refreshtoken
        }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler( async (req,res)=>{
    const {fullname,email,username,password}=req.body
    console.log("email",email);
    
    // begginer
    // if(fullname === "") {
    //     throw new ApiError(400, "Fullname is required")
    // }

    // expert
    if(
        [fullname, email, username, password].some((field)=> field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username },{ email }]
    })

    if (existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    if(!avatar){
        throw new ApiError(400, "Avatar was unable to upload please try again")
    }

    const user = await User.create({
        fullname,
        avatar : avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

const loginUser = asyncHandler(async (req,res)=>{
    // 1.
    const {email,password} = req.body;

    // 2.
    if(
        [email , password].some((fields)=>fields?.trim() === "")
    ){
        throw new ApiError(401 , "Enter both email and password")
    }

    // 3.
    const userInDB = await User.findOne({email})

    if(!userInDB){
        throw new ApiError(402,"Email is not registered")
    }

    // 4.
    const correctPassword = await bcrypt.compare(password, userInDB?.password)

    if(!correctPassword){
        throw new ApiError(403, "Entered password is incorrect for entered email")
    }

    // 5.
    const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(userInDB._id)

    const options = {
        httpOnly : true,
        secure : true
    }

    const loggedInUser = await User.findById(userInDB._id).select("-password -refreshToken")

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async (req,res)=>{
    // I need the user id to remove the refresh token from db
    // 1. get user id
    // 2. find user id in db
    // 3. remove refresh token from db
    // 4. clear cookies
    const userId = await req.user._id;
    User.findByIdAndUpdate(userId, 
        {
            $set : {refreshToken : undefined}
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookies("accessToken",options)
    .clearCookies("refreshToken",options)
    .json(
        new ApiResponse(
            200,
            {},
            "User logged Out Successfully"
        )
    )

})

export {
    registerUser,
    loginUser,
    logoutUser
}

// Only email based login

// 1. get email and password
// 2. validate email and password are not empty
// 3. check email in db or not
// 4. compare password
// 5. return cookies and accesstoken