const express = require('express');
const router = express.Router();
const db = require('../db/connect');


router.post('/v1/token', async (req, res) => {
    const { code } = req.body;
    const clientId = "9-fYOy5ow-LtJB8U_UPCVdJ4l6gv2whs6KlQFJUyaoTBlxBlqI5cm5hpU7tw-vNA";
    const clientSecret = "3rBy8maAg9G8FiidnZQ1ufeAeXW4A-d2iLmAxUieV3AOL7BpbIgZHaRofH-TmlHI";
    const authorizationCode = code;
    const redirectUri = "https://save4.online/";

    try {
        const response = await fetch("https://www.patreon.com/api/oauth2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                code: authorizationCode,
                grant_type: "authorization_code",
                redirect_uri: redirectUri
            })
        });
        const data = await response.json();

        if(data.access_token){
            const dataAsText = JSON.stringify(data);
            const sql = `INSERT INTO tokens (data) VALUES ('${dataAsText}')`;
            const createTableQuery = `CREATE TABLE IF NOT EXISTS tokens (
                                            id INT AUTO_INCREMENT PRIMARY KEY,
                                            uid INT,
                                            data TEXT NOT NULL
                                        )`;
            
            await db.connect();
            const connection = db.getConnection();

            try {
                await connection.query(createTableQuery);
                await connection.query(sql)
                connection.end();
            } catch (err) {
                console.log(err)
                connection.end();
            }
        }
        res.json(data);
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'failed' });
    }
});


// const getUserDetails = async (accessToken) => {
//     try {
//         const response = await fetch("https://www.patreon.com/api/oauth2/v2/user", {
//             method: "GET",
//             headers: {
//                 "Authorization": `Bearer ${accessToken}`
//             }
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const userData = await response.json();
//         console.log("User Data:", userData);

//         // Access user attributes
//         const userAttributes = userData.data.attributes;
//         const userName = userAttributes.full_name; // Get user's full name
//         const profilePicture = userAttributes.image_url; // Get user's profile picture URL

//         console.log("User Name:", userName);
//         console.log("Profile Picture URL:", profilePicture);
//     } catch (error) {
//         console.error("Error fetching user details:", error);
//     }
// };

// // Call the function with the access token
// getUserDetails(access_token); // Replace access_token with the actual token



router.post('/v1/identity', async (req, res) => {
    try {
        const response = await fetch("https://www.patreon.com/api/oauth2/v2/identity?include=memberships", {
            method: "GET",
            headers: {
                "Authorization": `Bearer inaHcVxIlytljWVeFx_VG8uwYKI5o2eg5I2w5D2qLik`
            }
        });
        const data = await response.json();
        const memberships = data.data.relationships.memberships.data;
        console.log(data, memberships)

    } catch (err) {
        console.log(err);
    }
    res.send('helo');
})

module.exports = router;