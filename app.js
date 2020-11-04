const express = require('express');
const cors = require('cors');
// const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');

module.exports = function (app, io) {

    app.use(morgan('dev'));

    app.use('/uploads', express.static('uploads'));

    app.use(helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"]
        }
    }));


    app.use(helmet.referrerPolicy({
        policy: 'same-origin'
    }))

    app.use(cors())

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(bodyParser.json());

    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

        if (req.method == 'Options') { //browser may send these requests
            res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, PUT");
            res.status(200).json({});
        }
        next();
    });

    mongoose.connect(process.env.MONGO_HOST + process.env.MONGO_PORT + process.env.MONGO_DATABASE, { //'mongodb://localhost:27017/schoolr'
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    /**Admin Routes */
    /**========================== Admin Master Academic Routes ==========================**/
    const AdminAcademicMedium = require('./routes/admin/master/academic/medium');
    const AdminAcademicSyllabus = require('./routes/admin/master/academic/syllabus');
    const AdminAcademicGrade = require('./routes/admin/master/academic/grade');
    const AdminAcademicSubject = require('./routes/admin/master/academic/subject');

    /**========================== Admin Learn Academic Routes ==========================**/

    const AdminFAQ = require('./routes/admin/master/faq');



    /** PartnerRoutes */
    const partnerRoutes = require('./routes/partner/partner');

    /**School Route Files */
    const SchoolAuthentication = require('./routes/school/authentication');
    const SchoolTeacher = require('./routes/school/teacher');
    const SchoolGroup = require('./routes/school/group');
    const SchoolCoordinator = require('./routes/school/coordinator');
    const SchoolStudent = require('./routes/school/student');




    /**Teacher Route Files */
    const TeacherAuthenticatoin = require('./routes/authentication/teacher/authentication');

    const TeacherFeed = require('./routes/feed/teacher');

    const TeacherGroup = require('./routes/group/teacher/group');
    const TeacherClasses = require('./routes/classes/teacher/classes')
    const TeacherConnection = require('./routes/group/teacher/connection');
    const TeacherSidemenu = require('./routes/sidemenu/teacher/sidemenu');
    const TeacherHomeWork = require('./routes/assignments/teacher/homeWork');
    const TeacherBroadCast = require('./routes/assignments/teacher/broadCast');
    const TeacherTest = require('./routes/assignments/teacher/test');
    const TeacherProjectWork = require('./routes/assignments/teacher/projectWork');
    const TeacherPost = require('./routes/assignments/teacher/post');
    const TeacherClassRoom = require('./routes/assignments/teacher/classRoom');
    const TeacherSchool = require('./routes/assignments/teacher/school');
    const TeacherPersonalEventPlanner = require('./routes/planner/teacher/personalEvent');
    const TeacherPlanner = require('./routes/planner/teacher/planner');
    const TeacherChat = require('./routes/chat/teacher/chat')(io)
    const TeacherMindBox = require('./routes/mindBox/teacher')

    const ChatSocketRoutes = require('./routes/chat/shared/chatSocketEvents')(io);



    /**========================== Notes Routes ==========================**/
    const TeacherQuestionBank = require('./routes/sidemenu/teacher/questionBank');


    /**Student Route Files */
    const StudentAuthentication = require('./routes/authentication/student/authentication');
    const StudentConnection = require('./routes/group/student/connection');
    const StudentNotification = require('./routes/notification/student/notifications');
    const StudentClasses = require('./routes/classes/student/classes');
    const StudentSidemenu = require('./routes/sidemenu/student/sidemenu');
    const StudentSchool = require('./routes/assignments/student/school');
    const StudentPersonalEventPlanner = require('./routes/planner/student/personalEvent');
    const StudentPlanner = require('./routes/planner/student/planner');
    const StudentChat = require('./routes/chat/student/chat')(io)
    const StudentMindBox = require('./routes/mindBox/student')
    const StudentFeed = require('./routes/feed/student');

    /** Learn Route Files */
    const LearnHome = require('./routes/learn/home');
    const LearnBook = require('./routes/learn/book');

    /**========================== Non-Academic Routes ==========================**/
    const LearnAptitude = require('./routes/learn/non-academic/aptitude');


    const LearnLibrary = require('./routes/learn/library');
    const LearnGuided = require('./routes/learn/guided');


    const LearnExercises = require('./routes/learn/exercise');
    const LearnTest = require('./routes/learn/test');
    const LearnActivityQuiz = require('./routes/learn/activityQuiz');


    /**========================== Notes Routes ==========================**/
    const Notes = require('./routes/notes');





    /**Admin Routes */
    app.use('/admin/academic/grade', AdminAcademicGrade)
    app.use('/admin/academic/medium', AdminAcademicMedium)
    app.use('/admin/academic/syllabus', AdminAcademicSyllabus)
    app.use('/admin/academic/subject', AdminAcademicSubject)
    // app.use('/admin/academic/video', AdminAcademicTopicVideo)


    app.use('/admin/faq', AdminFAQ)


    /** Partners */
    app.use('/partner', partnerRoutes);


    /**School Routes */
    app.use('/school/authentication', SchoolAuthentication)
    app.use('/school/teacher', SchoolTeacher)
    app.use('/school/group', SchoolGroup)
    app.use('/school/coordinator', SchoolCoordinator)
    app.use('/school/student', SchoolStudent)


    /**Teacher Routes */
    app.use('/teacher/authentication', TeacherAuthenticatoin);
    app.use('/teacher/feed', TeacherFeed);
    app.use('/teacher/group', TeacherGroup);
    app.use('/teacher/classes', TeacherClasses);
    app.use('/teacher/connection', TeacherConnection);
    app.use('/teacher/sidemenu', TeacherSidemenu);
    app.use('/teacher/assignments/homework', TeacherHomeWork);
    app.use('/teacher/assignments/announcement', TeacherBroadCast);
    app.use('/teacher/assignments/test', TeacherTest);
    app.use('/teacher/assignments/projectwork', TeacherProjectWork);
    app.use('/teacher/assignments/post', TeacherPost);
    app.use('/teacher/assignments/classRoom', TeacherClassRoom);
    app.use('/teacher/school', TeacherSchool);
    app.use('/teacher/planner/personalEvent', TeacherPersonalEventPlanner);
    app.use('/teacher/planner/', TeacherPlanner);
    app.use('/teacher/chat', TeacherChat);
    app.use('/teacher/mindBox', TeacherMindBox);

    app.use('/teacher/sidemenu/questionBank', TeacherQuestionBank);



    /**Student Routes */
    app.use('/student/authentication', StudentAuthentication);
    app.use('/student/connection', StudentConnection);
    app.use('/student/notification', StudentNotification);
    app.use('/student/sidemenu', StudentSidemenu);
    app.use('/student/classes', StudentClasses);
    app.use('/student/school', StudentSchool);
    app.use('/student/planner/personalEvent', StudentPersonalEventPlanner);
    app.use('/student/planner/', StudentPlanner);
    app.use('/student/chat/', StudentChat);
    app.use('/student/mindBox', StudentMindBox);
    app.use('/student/feed', StudentFeed);


    /**learn User Routes */
    app.use('/learn/book', LearnBook);
    app.use('/learn/library', LearnLibrary);
    app.use('/learn/guided', LearnGuided);

    app.use('/learn/test', LearnTest);
    app.use('/learn/exercise', LearnExercises);
    app.use('/learn/activityquiz', LearnActivityQuiz);

    app.use('/learn/home', LearnHome);

    app.use('/learn/aptitude', LearnAptitude);

    app.use('/note', Notes);


    app.use((req, res, next) => {
        const error = new Error('page not found');
        error.status = 404;
        next(error);
    });

    app.use((error, req, res, next) => {

        if (error.name == "MulterError") {
            error.status = "200";
        }

        console.log(error);

        res.status(error.status || 500).json({
            error: {
                status: 0,
                message: error.message,
                date: new Date()
            }
        });
    });
}