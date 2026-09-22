const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB =
    require("./config/db");

dotenv.config();

const app =
    express();

connectDB();

app.use(
    cors({
        origin: [
            "http://localhost:5173",
        ],
        credentials: true,
    })
);

app.use(
    express.json()
);

app.get(
    "/",
    (req, res) => {
        res.json({
            success: true,
            message:
                "Copter Code TeamFlow API is running",
        });
    }
);

app.use(
    "/api/auth",
    require("./routes/authRoutes")
);

app.use(
    "/api/projects",
    require("./routes/projectRoute")
);

app.use(
    "/api/tasks",
    require("./routes/taskRoutes")
);

app.use(
    (err, req, res, next) => {
        console.error(err);

        res.status(
            err.status || 500
        ).json({
            success: false,
            message:
                err.message ||
                "Internal server error",
        });
    }
);

const PORT =
    process.env.PORT || 5000;

app.listen(
    PORT,
    () => {
        console.log(
            `Server running on http://localhost:${PORT}`
        );
    }
);