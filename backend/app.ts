import express, {Request, Response} from 'express';
import {loginRouter} from './controller/users/login';
import {registerRouter} from './controller/users/register';
import cors from 'cors';
import {listUsersRouter} from './controller/users/listUsers';
import {deleteUserRouter} from './controller/users/deleteUser';
import {getUserByIdRouter} from "./controller/users/getUserByEmail";
import {forgetPasswordRouter} from "./controller/users/forgetPassword";
import {getAnnouncementsRouter} from './controller/announcement/getAnnouncements';
import {createAnnouncementRouter} from './controller/announcement/createAnnouncements';
import {createContentRouter} from './controller/content/createContent';
import {updateContentRouter} from './controller/content/updateContent';
import {readContentRouter} from './controller/content/getContent';
import {deleteContentRouter} from './controller/content/deleteContent';
import EmailRouter from './controller/users/forgetPasswordEmail';
import { readCoursesRouter } from './controller/courses/getCourseList';
import {updateUserRouter} from "./controller/users/updateUser";


// Create an Express app
const app = express();

// Enable CORS
app.use(cors());


// Middleware to parse JSON in request body
app.use(express.json());


app.get('/', (req: Request, res: Response) => {
    res.send('Hello from express typescript');
});

// Redirect requests to /login to loginRouter
app.use('/login', loginRouter);

app.use('/register', registerRouter);
app.use('/listUsers', listUsersRouter);
app.use('/deleteUser', deleteUserRouter);
app.use('/getUserById', getUserByIdRouter);
app.use('/forgetPassword', forgetPasswordRouter);
app.use('/announcements', getAnnouncementsRouter)
app.use('/announcements', createAnnouncementRouter)
app.use('/create-content', createContentRouter)
app.use('/update-content', updateContentRouter)
app.use('/get-content', readContentRouter)
app.use('/delete-content', deleteContentRouter)
app.use('/send-email', EmailRouter);
app.use('/get-courses',readCoursesRouter)
app.use('/updateUser', updateUserRouter);

app.listen(3000, () => {
    console.log('Server started on port 3000');
});

