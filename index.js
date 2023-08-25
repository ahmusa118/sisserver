
const express=require('express')
const app=express()
const cors=require('cors')
app.use(cors())
const jwt=require('jsonwebtoken')
const secretKey = require('./config');
const PayStack = require('paystack-node')
const bodyParser=require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
const ejs = require('ejs')
app.set('view engine', 'ejs')
const multer=require('multer')
require('dotenv').config()
const authenticateToken = require('./auth/Authtoken')
const mongoose=require('mongoose')
const Student=require('./models/Student')
const Majors=require('./models/Majors')
const Grades=require('./models/Grades')
const Department=require('./models/Department')
const APIKEY = 'sk_test_f2c71386864743ac7450134fc0e65b7ae3fc588a';
const environment = 'test';
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Set the destination folder for uploaded files
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      // Set the filename for uploaded files
      cb(null, Date.now() + '-' + file.originalname);
    }
  })

  const upload = multer({
    storage: storage,
    limits: { files: 1 } // Set the maximum number of files allowed to 5
  })
app.post('/dept', (req, res) => {
    const { name, departmentId, price, departmentType } = req.body;
    const dept = new Department({
      name,
      departmentId,
      price,
      departmentType,
    });
  
    dept
      .save()
      .then((savedDept) => {
        res.status(200).json(savedDept); // Respond with the saved department object
      })
      .catch((err) => {
        res.status(500).json({ error: err.message }); // Respond with the error message
      });
  })
app.post('/saveCartItems/:id/:level', async (req, res) => {
    try {
      const cartItemsToSend= req.body;
      const data=await Student.findOne({id:req.params.id})
      // Save the cart items to the database using the Grades model
      const savedCartItems = await Grades.insertMany(cartItemsToSend);
      // Respond with the saved cart items
      data.status=`${req.params.level} registered`
      data.count=0
      data.save()
      res.status(200).json(savedCartItems);
    } catch (error) {
      console.error('Error saving cart items:', error);
      res.status(500).json({ error: 'Failed to save cart items' });
    }
  });
  app.post('/upload', upload.single('images'), async (req, res) => {
    const data = await Student.find({courseSelected:req.body.course});
  
    const {
      fullName,
      id,
      email,
      password,
      phoneNumber,
      startDate,
      course,
      price,
    } = req.body;
    const numOfStudents = data.length;
    const genid = Number(id) + numOfStudents + 1;
    const images = req.file.path;
    const student = new Student({
      fullName,
      id: genid,
      email: email.toLowerCase(),
      password,
      phoneNumber,
      dateOfBirth: startDate,
      courseSelected: course,
      price,
      images,
    });
  
    try {
      const result = await student.save();
      res.status(200).json({ ok: result });
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error (MongoError: E11000 duplicate key error collection)
        res.status(409).json({ error: 'Duplicate key error' });
      } else if (error.name === 'ValidationError') {
        // Other errors (Mongoose validation error)
        res.status(400).json({ error: 'Validation error' });
      } else {
        // Internal server error or other errors
        res.status(500).json({ error: 'Internal Server Error' });
      
    }
      console.error('Error saving data:', error);
      
      connectToMongoDB() 
    }
  });
  const paystack = new PayStack(APIKEY, environment)
  app.get('/chg/:email/:price', (req, res) => {
    const email = req.params.email;
    const price = req.params.price;
   
  
    // Render the paystack template and pass the email and total variables as data
    res.render('paystack', { email, price })
  })

  app.get("/ind/:name", function(req, res) {
    const {name}=req.params
  res.sendFile(__dirname +'/uploads' +"/"+ name);
})
  app.post('/charge', async (req, res) => {
    try {
      // Log the payment details received from Paystack
      const datas = await Student.findOne({ email: req.body.email });
  
      if (req.body.paymentResponse.status === 'success') {
     datas.paid='Yes'
     datas.status='Studying'
     datas.save()
      } else {
        res.status(400).json({ success: false, message: 'Payment error' });
      }
    } catch (error) {
      console.error('Error saving data:', error);
      res.status(500).json({ success: false, message: 'Error saving data' });
    }
  });
  app.post('/grades/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const grade = await Grades.find({id:id});
      if (!grade) {
        return res.status(404).json({ message: 'Grade not found' });
      }
      res.json(grade);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  })
  app.post('/login', async (req, res) => {
    const det = await Student.findOne({
      email: { $regex: new RegExp(req.body.email, 'i') },
      password: req.body.password
    });
      if (!det) {
        res.status(404).json({ error: 'wrong username or password' });
      } else {
          
        const token = jwt.sign({ userId: det._id }, secretKey, { expiresIn: '1h' });
        res.json({ token });
      
    
      }
    })
    app.put('/promotion/:id/:level/:gpa', async (req, res) => {
        try {
          const data = await Student.findById(req.params.id);
          const grades = await Grades.find({ id: data.id });

          // Check if all grades with the same level as req.params.level are not 'IP'
          const allGradesNotIP = grades.every((grade) => grade.grade !== 'IP');
      
          if (data.level < 400) {
            // Check if the level and gpa combination already exists in the 'gpa' array
            const existingEntryIndex = data.gpa.findIndex(
              (entry) => entry.level === parseInt(req.params.level)
            );
      
            // Check if gpa is a valid number and not equal to zero
            const isGpaValid = !isNaN(parseFloat(req.params.gpa)) && parseFloat(req.params.gpa) !== 0;
      
           if ((allGradesNotIP  && isGpaValid && data.count==0 && data.status==`${req.params.level} registered`) || (data.status=='Studying' &&  allGradesNotIP  && isGpaValid && data.count==0)) {
              // Add a new entry for the level and gpa
              data.level = data.level + 100;
              data.status=`${data.level} unregistered`
              data.count=1
            }
      
            // Save the cgpa (cumulative GPA)
            data.cgpa = req.params.gpa;
      
            data.save();
            res.status(200).json(data);
          } else if (data.level == 400) {
            // Check for F
            data.cgpa = req.params.gpa;
      
            data.save();
            res.status(200).json('saved at 400');
          }
        } catch (err) {
          res.status(500).json(err);
        }
      });
      
      
      
   
      
    app.get('/dashboard', authenticateToken, async (req, res) => {
        const userId = req.userId;
      
        const house = await Student.findById(userId);
      
        if (!house) {
          res.status(404).json({ error: 'details not found' });
        } else {
          res.json(house);
        }
      })
  app.get('/getdept', async (req, res) => {
    try {
      const data = await Department.find();
      if (data.length > 0) {
        res.status(200).json(data);
      } else {
        res.status(404).json({ error: 'No departments found' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Error fetching data' });
    
    }
  });
  
app.post('/postcourse', async(req,res)=>{
const {courseName,majorType,level,departmentName,courseCode}=req.body
    const major=new Majors({
        courseName,majorType,level,departmentName,courseCode
})
major.save()
.then((saved) => {
    res.status(200).json(saved); // Respond with the saved major object
  })
  .catch((err) => {
    res.status(500).json({ error: err.message }); // Respond with the error message
  })
})

app.post('/100lcourse/:level',async(req,res)=>{
    const data=await Majors.find({ level:req.params.level})
    if(data){
        res.status(200).json(data)
    }else {
        res.status(500).json({ error: 'error'});
    }
})
async function connectToMongoDB() {
    try {
      await mongoose.connect(process.env.URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to MongoDB');
      // Continue with your code after successful connection
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      // Handle error
    }
}
connectToMongoDB()
const port=3000
app.listen(port,()=>{
    console.log(`connected to ${port}`)
})