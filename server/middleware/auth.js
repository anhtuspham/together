import jwt from "jsonwebtoken";


export const verifyToken = async (req, res, next) => {
    try {
        //From the req made in frontend we are grabbing Authorization
        let token = req.header("Authorization");


        if(!token){
            return res.status(403).send("Access Denied");
        }

        if(token.startsWith("Bearer "))
        {
            token = token.slice(7, token.length).trimLeft(); 
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err && err.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Token expired." });
            }

            if (err) {
                return res.status(403).json({ message: "Invalid Token." });
            }

            req.user = decoded;
            next();
        });
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}