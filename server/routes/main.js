const express  = require('express');
const router = express.Router();

// users model
const users = require('../models/users');
// video model
const videomodel = require('../models/video');
// importing post model
// const post  = require('../models/post');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminlayout = '../views/layouts/admin';
 
// video handlers
const fs = require('fs');
const path = require('path');
const multer = require('multer');



// helps fetch video
router.use('/uploads', express.static(path.join(__dirname, '/uploads')));
// console.log(path.join(__dirname, '/uploads'));


// video upload
// Define the path to the 'uploads' folder
const uploadsDir = path.join(__dirname, 'uploads');

// Check if the 'uploads' folder exists, and create it if not
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Save files in the 'uploads' folder
        cb(null, uploadsDir); // 'uploadsDir' is the correct path
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

// Endpoint to handle video to folder called uploads 
router.post('/upload', upload.single('video'), async (req, res) => {
    try {
       
        const token = req.cookies.token;
        // / Decode the token to get the user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace 'your_jwt_secret' with your secret key
        const userId = decoded.userId; 
        console.log('File uploaded:', req.file);

        // Save video metadata to MongoDB
       await saveVideoToDatabase(req.file.filename,userId);
        

        res.status(200).send('File uploaded and metadata saved successfully');
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Error uploading file');
    }
});


// save the videoname and userid in mangodb
// Function to save video name to MongoDB
async function saveVideoToDatabase(videoName,usersid) {
    try {
    //   / Assuming the token contains 'userId'
        // Create a new video document
        const video = new videomodel({
            videoplaceholder:videoName,
            videoname: videoName,
            userid: usersid
        });

        // Save the video document to the database
        await video.save();
        console.log('Video saved successfully');
    } catch (error) {
        console.error('Error saving video:', error);
    }
}



// middleware for checking is user loged in
const tokenmiddleware = (req, res, next) => {
    // Get the token from cookies
    const token = req.cookies.token;

    // If no token exists, redirect to login page
    if (!token) {
        return res.redirect('/login'); // Adjust the path if needed
    }

    try {
        // Decode and verify the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user ID or other data to the request object
        req.userId = decodedToken.userId;

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        // If token verification fails, redirect to login
        console.error('Token verification failed:', error.message);
         return res.redirect('/login');
    }
};



// the / route
router.get('/',(req,res)=>{
    const locals={
        title:'Home'
    }
    res.render('index',{locals});
});

// register route (get)
router.get('/register',(req,res)=>{
    const locals={
        title:'Register'
    }
      // prevent loged in user to go to login route
    // Get the token from cookies
//  const token = req.cookies.token;

 // If no token exists, redirect to register page
//  if (!token) {
      res.render('register',{locals}); // Adjust the path if needed
//  }
//  return res.redirect('/users/dashboard');
});


// login route (get)
router.get('/login',(req,res)=>{
    const locals={
        title:'Login'
    }
    // prevent loged in user to go to login route
    // Get the token from cookies
//  const token = req.cookies.token;

 // If no token exists, redirect to login page
//  if (token) {
     res.render('login',{locals});
// }
// res.redirect('/login',{locals}); // Adjust the path if needed
    // res.render('login');
});



// register route (post)
router.post('/register',async(req,res)=>{

    try {
    
        const hashedpassword = await bcrypt.hash(req.body.upwd,10);
        try {
            const addnewuser = await users.create({
                username:req.body.uname,
                email:req.body.uemail,
                password:hashedpassword
            });
            res.status(201).json({message:'user created',addnewuser});

        } catch (error) {

            if(error.code === 11000){
             res.status(400).json({message:'Users already in use'});
            }
             res.status(500).json({message:'internal server error'});
            
        }
        
    } catch (error) {
     console.log(error);
        
    }
});



// login route (post)
router.post('/authenticate', async (req, res) => {
    try {
        const { uemail, upwd } = req.body;

        // Find the user in the database
        const user = await users.findOne({ email: uemail });
        if (!user) {
            return res.status(401).json({ message: 'User does not exist' });
        }

        // Validate password
        const validatepassword = await bcrypt.compare(upwd, user.password);
        if (!validatepassword) {
            return res.status(401).json({ message: 'Wrong password' });
        }

        // Create token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

        // Save the token into a cookie
        res.cookie('token', token, { httpOnly: true });

        // Redirect to the dashboard
        res.redirect('/users/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// dashboard route (get)
router.get('/users/dashboard',tokenmiddleware, async(req, res) => {
  
    try {
        const locals={
            title:'Dashboard'
        }
        const displayvideo = await videomodel.find();
        res.render('users/dashboard',{locals, displayvideo, layout:adminlayout});
    } catch (error) {
        
    }
});












// users faction inside the dashboard
//-------------------------------------
// recording video route
router.get('/users/record-screen', tokenmiddleware, (req,res)=>{
    const locals = {
        title:'Record Screen',
    }

        res.render('users/record-screen',{locals,layout:adminlayout});
});

// display single video for the user
router.get('/users/displayvideo/:id',async(req,res)=>{
    try {
        const locals = {
            title:'display video'
        }
            
        const data = await videomodel.findById({_id:req.params.id});
        res.render('users/displaysinglevideo',{locals,data,layout:adminlayout});
    } catch (error) {
        
    }
});


// display single video for the vistor(some one link is shared with)
router.get('/visitor/lessonvideo/:id',async(req,res)=>{
try {
    const locals = {
        title:'display video'
    }
        
    const data = await videomodel.findById({_id:req.params.id});
    res.render('users/sharevideo',{locals,data});
} catch (error) {
    
}
});


// update video title route (get)
router.get('/users/singlevideo/:id',tokenmiddleware,async(req,res)=>{
    const locals = {
        title:'update video title'
    }
    const data = await videomodel.findById({_id:req.params.id});
    res.render('users/updatevideo', {locals,data,layout:adminlayout}); 
});

// update video title route (put)
router.put('/users/singlevideo/:id',tokenmiddleware,async(req,res)=>{
    
    try {
        await videomodel.findByIdAndUpdate(req.params.id,{
            videoplaceholder:req.body.vieotitle,
            updatedAt:Date.now()
        });
        res.redirect('/users/dashboard'); 
    } catch (error) {
        console.log(error);
        
    }
});

// delete single video
router.delete('/user/deletvideo/:id',tokenmiddleware,async(req,res)=>{
    try {
        await videomodel.deleteOne({_id:req.params.id});
        res.redirect('/users/dashboard');
} catch (error) {
    console.log(error);

}
});

// logout route - get request
router.get('/logout', tokenmiddleware , async(req,res)=>{
    // clear the cookie
    res.clearCookie('token');
    res.redirect('/login');
    });
module.exports = router;