import { supabase } from '../utils/supabaseClient.js'

document.addEventListener("DOMContentLoaded", async () => {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (!session || error) {
        alert("You have to login")
        window.location.href = "index.html";
        return;
    }

    console.log(session.user.email)

    const { data: userData, error: dataError } = await supabase
    .from('users')
    .select()
    .eq('email', session.user.email)
    .single();
    console.log(`Welcome user: ${JSON.stringify(userData.username)}`)
    console.log(userData);

    const logoutButton = document.getElementById("logoutButton")
    logoutButton.addEventListener("click", async () => {
        const { error: logoutError } = await supabase.auth.signOut()
        if (logoutError) {
            alert("Theres an error: ", logoutError.message);

        } else {
            alert("Logout successfully!");
            window.location.href = '../../pages/index.html'
        }

    })

    const imageInput = document.getElementById("imageInput");
    const uploadButton = document.getElementById("uploadButton");
    uploadButton.addEventListener("click", async () => {
        const file = imageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const imageBlob = e.target.result;
                const preview = document.createElement("img");
                preview.src = imageBlob;
                preview.style.width = "100px";
                preview.style.height = "auto";
                document.body.appendChild(preview);
            }

            const filePath = `user_${userData.id}/${Date.now()}_${file.name}`
            console.log(filePath);
            const { data: imageData, error: imageError } = await supabase
            .storage
            .from('posts-images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });
            if (imageError) {
                alert("Image error" + imageError.message)
                return;
            }
            alert("Image uploaded successfully");
            
        }

    })

    const retrieveButton = document.getElementById("retrieveButton");
        retrieveButton.addEventListener("click", async () => {
            console.log("Clicked!")
            const { data: retrieveData, error } = await supabase
            .storage
            .from('posts-images')
            .list(`user_${userData.id}`);
            
            if (error) {
                console.error("Error retrieving images:", error.message);
                return;
            }

            console.log(retrieveData);


            for (const file of retrieveData) {
                console.log(file);
                const retrieveImage = document.createElement("img");
                retrieveImage.src = await supabase
                .storage
                .from('posts-images')
                .getPublicUrl(`user_${userData.id}/${file.name}`).data.publicUrl;
                retrieveImage.style.width = "150px";
                retrieveImage.style.width = "auto";
                document.body.appendChild(retrieveImage);
                console.log("1:",retrieveData.publicUrl, "2:",retrieveData, "3:",retrieveImage.src);
            };

        });
})
