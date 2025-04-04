import { supabase } from '../utils/supabaseClient.js'
import { matchList } from '../utils/matchList.js'
import { totalStamps } from '../utils/totalStamps.js'

mapboxgl.accessToken = 'pk.eyJ1IjoibXluYXZ1IiwiYSI6ImNtM3NzaWhpejAxM3Qya29tcTltOGhqd2EifQ.NF_TfdXji0T4Mn-qDeyzQw';
const submitButton = document.getElementById('submitButton');
const plusButton = document.getElementById('plusButton');



document.addEventListener("DOMContentLoaded", async () => {

    const { data: { session }, error } = await supabase.auth.getSession();
    if (!session || error) {
        alert("You have to login")
        window.location.href = "index.html";
        return;
    }
    console.log("session.user",session.user)

    const { data: userData, error: dataError } = await supabase
    .from('users')
    .select()
    .eq('email', session.user.email)
    .single();
    console.log(`Welcome user: ${JSON.stringify(userData.username)}`)
    console.log(userData);
    const userID = userData.id;

    const {data: listOfPosts, error: listOfPostsErrors } = await supabase
    .from('posts')
    .select()
    .eq('user_id', userID);
    if (listOfPostsErrors) {
        console.log("error",listOfPostsErrors.message);
    }
    console.log("listOfPosts", listOfPosts);

    let geojson = {
        "type": "FeatureCollection",
        "features": listOfPosts.map(row => ({
            type: 'Feature',
            geometry: { 
                type: 'Point', 
                coordinates: [row.longitude, row.latitude] 
            },
            properties: {
                description: row.caption,
                country: row.country,
                location: row.location_name
            }
        }))
      };
      console.log("geojson",geojson);

    let map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mynavu/cm3std23v009l01sd8csudg7h', // Light mode
        projection: 'globe',
        zoom: 1.5,
        center: [-90, 40]
    });

    map.on('load', () => {
        plusButton.style.display = 'flex';
        
    });
    
    map.on('style.load', () => {
        plusButton.style.display = 'flex';
        
    });

    function addPointsLayer(map, geojson) {
        if (!map.getSource('points')) {
            map.addSource('points', {
                type: 'geojson',
                data: geojson
            });
        }
        if (!map.getLayer('points-layer')) {
            map.loadImage('./pointer1.png', (error, image) => {
                if (error) throw error;
                if (!map.hasImage('custom-pointer')) {
                    map.addImage('custom-pointer', image);
                }
                map.addLayer({
                    id: 'points-layer',
                    type: 'symbol',
                    source: 'points',
                    layout: {
                        'icon-image': 'custom-pointer',
                        'icon-size': 0.07,
                        'icon-allow-overlap': true,
                        'icon-offset': [0, -280]
                    }
                });
            });
        }
    }



    const logOutButton = document.getElementById("logOutButton")
    logOutButton.addEventListener("click", async () => {
        const { error: logOutError } = await supabase.auth.signOut()
        if (logOutError) {
            alert("Theres an error: ", logOutError.message);
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
