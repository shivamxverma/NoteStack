import {Router} from 'express';
import { loginUser, LogoutUser, registerUser , refreshAccessToken} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

// Secured Route

router.route("/logout").post(verifyJWT, LogoutUser);
router.route("/refresh-token").post(refreshAccessToken);

export default router;