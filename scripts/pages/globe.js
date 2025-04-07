import { supabase } from '../utils/supabaseClient.js'
import { matchList } from '../utils/matchList.js'
import { totalStamps } from '../utils/totalStamps.js'

mapboxgl.accessToken = 'pk.eyJ1IjoibXluYXZ1IiwiYSI6ImNtM3NzaWhpejAxM3Qya29tcTltOGhqd2EifQ.NF_TfdXji0T4Mn-qDeyzQw';
const submitButton = document.getElementById('submitButton');
const plusButton = document.getElementById('plusButton');
const text = document.querySelector('.text');
const entry = document.getElementById('entry');
const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById('imagePreview');
const confirmLocation = document.getElementById('confirmLocation');
const currentLocationButton = document.getElementById('currentLocationButton');
const somewhereElseButton = document.getElementById('somewhereElseButton');
const exitButton2 = document.querySelector('.exit-button2');


document.addEventListener("DOMContentLoaded", async () => {

    const { data: { session }, error } = await supabase.auth.getSession();
    if (!session || error) {
        alert("You have to login")
        window.location.href = '../../index.html';
        return;
    }
    //console.log("session.user",session.user)

    const { data: userData, error: dataError } = await supabase
    .from('users')
    .select()
    .eq('email', session.user.email)
    .single();
    //console.log(`Welcome user: ${JSON.stringify(userData.username)}`)
    //console.log(userData);
    const userID = userData.id;

    const usernameDisplay = document.getElementById('username');
    usernameDisplay.innerText = `@${userData.username}`;



    // DELETE ALL ROWS WITH NO IMAGE URL
    const response = await supabase
    .from('posts')
    .delete()
    .eq('image_url', "");

    let {data: listOfPosts, error: listOfPostsErrors } = await supabase
    .from('posts')
    .select()
    .eq('user_id', userID)
    .neq('image_url', "");
    if (listOfPostsErrors) {
        console.log("error",listOfPostsErrors.message);
    }
    //console.log("listOfPosts", listOfPosts);

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
                image_url: row.image_url,
                country: row.country,
                location: row.location_name,
                post_id: row.post_id
            }
        }))
      };

    async function updateMap() {
        let {data: listOfPosts, error: listOfPostsErrors } = await supabase
        .from('posts')
        .select()
        .eq('user_id', userID)
        .neq('image_url', "");
        if (listOfPostsErrors) {
            console.log("error",listOfPostsErrors.message);
        }
        
        geojson = {
            "type": "FeatureCollection",
            "features": listOfPosts.map(row => ({
                type: 'Feature',
                geometry: { 
                    type: 'Point', 
                    coordinates: [row.longitude, row.latitude] 
                },
                properties: {
                    description: row.caption,
                    image_url: row.image_url,
                    country: row.country,
                    location: row.location_name,
                    post_id: row.post_id
                }
            }))
          }; 
        map.getSource('points').setData(geojson);
        //console.log(geojson);
    }
     //console.log("geojson",geojson);

    let currentLocation = {
        "type": "FeatureCollection",
        "features": [
        ]
      };


    let map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mynavu/cm3std23v009l01sd8csudg7h', // Light mode
        projection: 'globe',
        zoom: 1.5,
        center: [-90, 40]
    });

    function addPointsLayer(map, geojson) {
        if (!map.getSource('points')) {
            map.addSource('points', {
                type: 'geojson',
                data: geojson
            });
        }
        if (!map.getLayer('points-layer')) {
            map.loadImage('../../assets/default_pointer.png', (error, image) => {
                if (error) throw error;
                if (!map.hasImage('default-pointer')) {
                    map.addImage('default-pointer', image);
                }
                map.addLayer({
                    id: 'points-layer',
                    type: 'symbol',
                    source: 'points',
                    layout: {
                        'icon-image': 'default-pointer',
                        'icon-size': 0.07,
                        'icon-allow-overlap': true,
                        'icon-offset': [0, -280]
                    }
                });
            });
        }
    }



    map.on('load', () => {
        plusButton.style.display = 'flex';
        addPointsLayer(map, geojson);
        
    });
    
    map.on('style.load', () => {
        plusButton.style.display = 'flex';
        addPointsLayer(map, geojson);
    });



    function addCurrentLocation(map, currentLocation) {
        if (!map.getSource('currentPoint')) {
            map.addSource('currentPoint', {
                type: 'geojson',
                data: currentLocation
            });
        }
        if (!map.getLayer('current-points-layer')) {
            map.loadImage('../../assets/realtime_pointer.png', (error, image) => {
                if (error) throw error;
                if (!map.hasImage('realtime_pointer')) {
                    map.addImage('realtime_pointer', image);
                }
                map.addLayer({
                    id: 'current-points-layer',
                    type: 'symbol',
                    source: 'currentPoint',
                    layout: {
                        'icon-image': 'realtime_pointer',
                        'icon-size': 0.2,
                        'icon-allow-overlap': true,
                        'icon-offset': [25, -185]
                    }
                });
            });
        }
    }

    const weatherDisplay = document.querySelector('.weatherDisplay');
    const weatherIcon = {
        "01d" : '<i class="weatherIcon bi bi-brightness-high-fill"></i>',
        "02d" : '<i class="weatherIcon bi bi-cloud-sun-fill"></i>',
        "03d" : '<i class="weatherIcon bi bi-cloud-fill"></i>',
        "04d" : '<i class="weatherIcon bi bi-clouds-fill"></i>',
        "09d" : '<i class="weatherIcon bi bi-cloud-drizzle-fill"></i>',
        "10d" : '<i class="weatherIcon bi bi-cloud-rain-heavy-fill"></i>',
        "11d" : '<i class="weatherIcon bi bi-cloud-lightning-fill"></i>',
        "13d" : '<i class="weatherIcon bi bi-cloud-snow-fill"></i>',
        "50d" : '<i class="weatherIcon bi bi-cloud-haze2-fill"></i>',
        "01n" : '<i class="weatherIcon bi bi-moon-fill"></i>',
        "02n" : '<i class="weatherIcon bi bi-cloud-moon-fill"></i>',
        "03n" : '<i class="weatherIcon bi bi-cloud-fill"></i>',
        "04n" : '<i class="weatherIcon bi bi-clouds-fill"></i>',
        "09n" : '<i class="weatherIcon bi bi-cloud-drizzle-fill"></i>',
        "10n" : '<i class="weatherIcon bi bi-cloud-rain-heavy-fill"></i>',
        "11n" : '<i class="weatherIcon bi bi-cloud-lightning-fill"></i>',
        "13n" : '<i class="weatherIcon bi bi-cloud-snow-fill"></i>',
        "50n" : '<i class="weatherIcon bi bi-cloud-haze2-fill"></i>'
    };

let locationAccess = false;

navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;
    map.flyTo({
        center: [longitude, latitude],
        zoom: 3,
        speed: 0.8
    });
    locationAccess = true;

    const point = {
                   "type": "Feature",
                   "geometry": {
                       "type": "Point",
                       "coordinates": [longitude, latitude]
                       }
                   };
    if (currentLocation.features.length === 0) {
   currentLocation.features.push(point);
   };
   const performStyleDependentActions = () => {
    if (currentLocation.features.length > 0) {
                addCurrentLocation(map, currentLocation);
                const weather = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=71eda31f2208ffe09fa48962d3a84835`;
                fetch(weather)
                .then(response => response.json())
                .then(data => {
                    const tempInCelsius = Math.floor(parseFloat(data.main.temp) - 273.15).toString();
                    const iconName = data.weather[0].icon;
                    weatherDisplay.innerHTML = `${weatherIcon[iconName]} &nbsp ${tempInCelsius}°`;
                    weatherDisplay.style.display = "block";

                })
                .catch(error => console.log("error"));
        }
    }
    if (map.isStyleLoaded()) {
        performStyleDependentActions();
        plusButton.style.display = 'flex';
        addPointsLayer(map, geojson);
    } else {
        /*
        map.on('style.load', () => {
            performStyleDependentActions();
        });
        map.on('load', () => {
            performStyleDependentActions();
        });
        */
        map.on('load', () => {
            plusButton.style.display = 'flex';
            addPointsLayer(map, geojson);
            performStyleDependentActions();
            
        });
        
        map.on('style.load', () => {
            plusButton.style.display = 'flex';
            addPointsLayer(map, geojson);
            performStyleDependentActions();
        });
    }
});

    let hoverPopup = null;
    let clickPopup = null;

    // HOVERING A POST
    map.on('mouseenter', 'points-layer', (e) => {
        if (!clickPopup && text.style.display !== 'block') {
        map.getCanvas().style.cursor = 'pointer';
        const coordinates = e.lngLat;
        const location = e.features[0]?.properties?.location;
    
        hoverPopup = new mapboxgl.Popup({
                    closeButton: false,
                    closeOnClick: false
                })
                .setLngLat(coordinates)
                .setHTML(location)
                .addTo(map);
        }
    });
    map.on('mouseleave', 'points-layer', () => {
        if (text.style.display !== 'block') {
        map.getCanvas().style.cursor = '';}
        if (hoverPopup) {
            hoverPopup.getElement().style.transition = "opacity 1s ease-out";
            hoverPopup.getElement().style.opacity = 0;
            setTimeout(() => {
                hoverPopup.remove();
                hoverPopup = null;
            }, 50);
        }
    });

    // ADDING A POST
    function enablePointAdding() {
        map.getCanvas().style.cursor = 'pointer';
        text.style.display = 'block';
        map.on('click', addPoint);
    }
    function disablePointAdding() {
        map.getCanvas().style.cursor = '';
        text.style.display = 'none';
        map.off('click', addPoint);
    }

    async function deletePoint(post_id) {
        const { data: urlData, error: urlError} = await supabase
        .from('posts')
        .select()
        .eq('post_id', post_id)
        .single();
        //console.log("urlData", urlData);
        let imagePath = urlData.image_url.split('/posts-images/')[1];
        //console.log("imagePath", imagePath);
        if (urlError) {
            alert("urlError", urlError);
        }
        if (imagePath !== null) {
            const { data, error } = await supabase
            .storage
            .from('posts-images')
            .remove([imagePath])
            if (error) {
                alert("Error in deleting image in bucket:", error.message);
            }
            //console.log("deleted")
        }

        const response = await supabase
        .from('posts')
        .delete()
        .eq('post_id', post_id)
        updateMap();
    }

    const clearPreviousEntry = () => {
        document.querySelector('input[name="description"]').value = '';
        imagePreview.src = '';
        imagePreview.style.display = 'none';
        imageInput.value = '';
   }

   imageInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function (e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            };
        }
    });



   const replaceSubmitButton = () => {
    const submitButton = document.getElementById('submitButton');
    submitButton.replaceWith(submitButton.cloneNode(true)); // Remove old listeners
    }

    // NOTIFICATIONS FOR STAMPS
    const stampNotif = document.querySelector(".stampNotif");
    const area = document.querySelector(".area");

  async function receiveStamp(location) {
    let stampRecieved = false;
    let stampMatched = false;

        const { data: stampList, error: stampListError } = await supabase
        .from('posts')
        .select('stamp')
        .eq('user_id', userID)
        const stampValues = stampList.map(item => item.stamp);
        //console.log("Location:", location);
        matchList.forEach(({ regex, stamp }) => {
            if (location.match(regex)) { 
                stampMatched = stamp;
                if (!stampValues.includes(stamp)) {
                    stampRecieved = stamp;
                    return [stampRecieved, stampMatched];
                    }
            }
        });
        return [stampRecieved, stampMatched];
    }

    function stampNotify(stamp) {
        const formattedStamp = stamp.replaceAll("_", " ");
        //console.log("formattedStamp",formattedStamp);
        let imageLink = `https://esrkdaokgokznnqzgwrg.supabase.co/storage/v1/object/public/stamp-images//${stamp}.PNG`
        const HTMLString = `
        <div class="stampNotif">
            <img src="${imageLink}">
            <div class="achievement">
                <h3>New Stamp Unlocked!</h3>
                <h1>${formattedStamp}</h1>
                <p> Click <a href="stamps.html">here</a> to view </p>
            </div>
        </div>
        `;
        area.insertAdjacentHTML('beforeend', HTMLString);
        setTimeout(() => {
        area.innerHTML = "";
        }, 8000)
    };

    let currentPointID;
    async function addPoint(e) {
        const uploadButton = document.getElementById("uploadButton");
        let description = "";
        let location;
        let countryName;
        let indexLocation;
        disablePointAdding();
        const coordinates = e.lngLat;
        const { lng, lat } = e.lngLat;
        const reverseGeoCode = `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&language=en&access_token=${mapboxgl.accessToken}`;
        try {
            const response = await fetch(reverseGeoCode);
            const data = await response.json();
            const lastIndex = data.features.length - 1;
            const oddOrEven = data.features.length % 2;

            if (oddOrEven === 0) {
                indexLocation = (data.features.length / 2) - 1;
            } else {
                indexLocation = ((data.features.length + 1) / 2) - 1;
                if (indexLocation === -1) {
                    indexLocation = 0;
                }
            }
            location = data.features[indexLocation].properties.full_address;
            countryName = data.features[indexLocation].properties.context.country.name;
        } catch (error) {
            //console.log('Error fetching or processing geocoding data');
            location = "Unknown Location";
            countryName = null;
        }
        const { data: insertData, error: insertError } = await supabase
        .from('posts')
        .insert({ 
            image_url: "", 
            caption: "", 
            location_name: location, 
            longitude: lng, 
            latitude: lat, 
            country: countryName, 
            user_id: userID 
        })
        .select('post_id')
        .single();
        let currentPostID = insertData.post_id;
        currentPointID = currentPostID;
        console.log("currentPostID",currentPostID)

        entry.showModal();
        exitButton.style.display = 'block';
        replaceSubmitButton();
        const newSubmitButton = document.getElementById('submitButton');
        newSubmitButton.innerText = 'Post';
        clearPreviousEntry();

        newSubmitButton.addEventListener("click", async () => {
            const file = imageInput.files[0];
            if (!file) {
                alert("Upload an image to post");
                return;
            }
            if (file) {    
                description = document.querySelector('input[name="description"]').value;
                const filePath = `user_${userData.id}/${Date.now()}_${file.name}`;
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
                
                const { data: urlData, error: urlError } = await supabase
                .storage
                .from('posts-images')
                .getPublicUrl(filePath);

                if (urlError) {
                    alert("URL error" + urlError.message)
                    return;
                }

                const { error: updateError } = await supabase
                .from('posts')
                .update({ 
                    image_url: urlData.publicUrl, 
                    caption: description  
                })
                .eq('post_id', currentPostID)

                if (updateError) {
                    alert("Update error" + updateError.message)
                    return;
                }
                let stamp = await receiveStamp(location);
                if (stamp[1] !== false) {
                    const { data: insertData, error: insertError } = await supabase
                    .from('posts')
                    .update({ 
                        stamp: stamp[1]
                    })
                    .eq('post_id', currentPostID);
                    if (insertError) {
                        alert("Stamp error", insertError.message);
                    }
                    if (stamp[0] !== false) {
                        stampNotify(stamp[0]);
                    };
                }
            }
            entry.close();
            clearPreviousEntry();
            updateMap();
            plusButton.style.display = 'block';
        })
    }

    //PRELOAD IMAGES
    function preloadStamps(list) {
        const promises = list.map(({ stamp }) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                const preloadLink = `https://esrkdaokgokznnqzgwrg.supabase.co/storage/v1/object/public/stamp-images/${stamp}.PNG`;
                img.src = preloadLink;
                img.onload = () => resolve(preloadLink);
                img.onerror = () => reject(new Error(`Failed to load image: ${preloadLink}`));
            });
        });
        return Promise.all(promises);
    }

    async function preloadUserImages() {
        const { data, error } = await supabase
        .from('posts')
        .select('image_url')
        .eq('user_id', userID)
        //console.log("data", data);

        const promises = data.map(url => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = url.image_url;
                img.onload = () => resolve(url.image_url);
                img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
            });
        });
        return Promise.all(promises);
    }

    try {
        await preloadStamps(matchList);
        await preloadUserImages();
        console.log("All images preloaded successfully");
    } catch (error) {
        console.error("Error preloading images:", error.message);
    }

    

    //CLICKING A POPUP
    map.on('click', 'points-layer', function(e) {
        if (text.style.display !== 'block') {
            const coordinates = e.lngLat;
            const feature = e.features[0];
            const currentImage = feature.properties.image_url;
            const location = feature.properties.location;
            const description = feature.properties.description || "No description";
            const post_id = feature.properties.post_id;

            /*
            console.log("e", e);
            console.log('Feature:', feature);
            console.log("e.features", e.features);
            console.log("post_id",post_id);
            */

            if (currentImage) {
                console.log(`Image URL: ${currentImage}`);
                const image = `<img src="${currentImage}" style="width: 200px; display: block; " />`;
                        if (clickPopup) {
                            clickPopup.remove();
                        }
                        clickPopup = new mapboxgl.Popup()
                            .setLngLat(coordinates)
                            .setHTML(`
                                <div class="popup">
                                    <p class="location_description margin">📍<i>${location}</i></p>
                                    ${image}
                                    <p class="location_description">${description}</p>
                                    <div class="container-delete">
                                        <button id="delete-btn-${post_id}" class="delete-btn">Delete <i class="bi bi-trash-fill"></i> </button>
                                    </div>
                                </div>
                            `)
                            .addTo(map);
                        // Listeners for the buttons
                        setTimeout(() => {
                            // Ensure the DOM has rendered before adding listeners
                            document.getElementById(`delete-btn-${post_id}`).addEventListener('click', () => {
                                console.log("Deleting ID:", post_id);
                                deletePoint(post_id);
                                clickPopup.remove();
                            });
                        }, 100);
                        clickPopup.on('close', () => {
                                clickPopup = null;
                            });
            } else {
                console.warn(`No image found`);
            }
        }
    });

    const confirmCloseButton = document.getElementById('confirmCloseButton')
    const exitButton = document.querySelector('.exit-button');
    const cancelButton = document.getElementById('cancelButton');
    const discardButton = document.getElementById('discardButton');

    exitButton.addEventListener('click', () => {
        confirmCloseButton.showModal();
    });

    cancelButton.addEventListener('click', () => {
        confirmCloseButton.close();
    })

    discardButton.addEventListener('click', () => {
        confirmCloseButton.close();
        clearPreviousEntry();
        entry.close();
        plusButton.style.display = 'block';
        deletePoint(currentPointID);
    })

    let currentLocationListenerAdded = false;
    plusButton.addEventListener('click', function () {
        plusButton.style.display = 'none';
        confirmLocation.showModal();
        if (!currentLocationListenerAdded) {
            currentLocationButton.addEventListener('click', () => {
                if (locationAccess) {
                    confirmLocation.close();
                    plusButton.style.display = "block";
                    const currentCoords = currentLocation.features[0].geometry.coordinates;
                    const simulatedEvent = {
                        lngLat: {
                            lng: currentCoords[0],
                            lat: currentCoords[1]
                        },
                        point: null,
                        originalEvent: null,
                        type: "geolocate",
                        target: map,
                        _defaultPrevented: false
                    };
                    addPoint(simulatedEvent);
                } else {
                alert("Please enable location services in your browser settings to use this feature. Refresh the page once enabled.");
                plusButton.style.display = "block";
                };
            });
            currentLocationListenerAdded = true;
        }
        somewhereElseButton.addEventListener('click', () => {
            enablePointAdding();
        });
        exitButton2.addEventListener('click', (e) => {
            e.preventDefault();
            confirmLocation.close();
            plusButton.style.display = "block";
        });
    });

    const logOutButton = document.getElementById("logOutButton")
    logOutButton.addEventListener("click", async () => {
        const { error: logOutError } = await supabase.auth.signOut()
        if (logOutError) {
            alert("Theres an error: ", logOutError.message);
        } else {
            window.location.href = '../../index.html'
        }
    })


    //SEARCH BAR AND OTHER CONTROLS
            const geocoder = new MapboxGeocoder({
                accessToken: mapboxgl.accessToken,
                types: 'address,poi',
                proximity: [-73.99209, 40.68933]
            });
            map.addControl(geocoder, 'top-right');

            // Fullscreen and Navigation Controls
            map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');
            map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

            const zoomButton = document.querySelector('.mapboxgl-ctrl-fullscreen');
            const searchBar = document.querySelector('.mapboxgl-ctrl-geocoder');
            const menu = document.querySelector('.menu');

            zoomButton.addEventListener("click", () => {
                if (!zoomButton.classList.contains("zoomed")) {
                    zoomButton.classList.add("zoomed");
                    customization.style.display = "none";
                    menu.style.display = "none";
                    plusButton.style.display = "none";
                    searchBar.style.display = "none";
                } else {
                    zoomButton.classList.remove("zoomed");
                    customization.style.display = "flex";
                    menu.style.display = "flex";
                    plusButton.style.display = "flex";
                    searchBar.style.display = "block";
                }
            });

            // SETTINGS
            const settingsButton = document.querySelector('.menuSettings');
            const customization = document.querySelector('.customization');
            const mode = document.querySelector(".mode");
            const modeButton = document.getElementById('check');
            const spinStyle = document.querySelector(".modeButton1");
            
            settingsButton.addEventListener("click", () => {
                customization.style.display = (customization.style.display === "none" || customization.style.display === "") ? "flex" : "none";
            })

            const savedState = localStorage.getItem('checkboxState');

            function darkMode() {
                localStorage.setItem('checkboxState', JSON.stringify(modeButton.checked));
                map.setStyle('mapbox://styles/mynavu/cm4b3wrge01bm01si09uyal4o');
                map.on('style.load', () => {
                mode.innerText = "Mode: Dark";
                spinStyle.style.backgroundColor = "#001f61";
                spinStyle.style.setProperty('--before-background-color', 'white');
                spinStyle.style.setProperty('--before-box-shadow', '0 0 10px white');
                });
        }
        
        function lightMode() {
                //console.log("Light Mode");
                localStorage.setItem('checkboxState', JSON.stringify(modeButton.checked));
                map.setStyle('mapbox://styles/mynavu/cm3std23v009l01sd8csudg7h'); // Light mode style
                map.on('style.load', () => {
                mode.innerText = "Mode: Light";
                spinStyle.style.backgroundColor = "#6bd8ff";
                spinStyle.style.setProperty('--before-background-color', '#fffc00');
                spinStyle.style.setProperty('--before-box-shadow', '0 0 10px #fffc00');
                });
              
        }

        if (savedState !== null) {
            modeButton.checked = JSON.parse(savedState);
          };
          modeButton.checked ? darkMode() : lightMode();
          //console.log("modeButton.checked", modeButton.checked);
      
      modeButton.addEventListener('change', () => {
          modeButton.checked ? darkMode() : lightMode();
          //console.log("on change modeButton.checked", modeButton.checked);
      });


      // SPINNING
const secondsPerRevolution = 120;
const maxSpinZoom = 5;
const slowSpinZoom = 3;
let userInteracting = false;
let spinEnabled = false;

function spinGlobe() {
    const zoom = map.getZoom();
    if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
        let distancePerSecond = 360 / secondsPerRevolution;
        if (zoom > slowSpinZoom) {
            const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
                            distancePerSecond *= zoomDif;

        }
        const center = map.getCenter();
        center.lng -= distancePerSecond;
        map.easeTo({ center, duration: 1000, easing: (n) => n });
    }
}

map.on('mousedown',() => {
    userInteracting = true;
});

const events = ['mouseup', 'dragend', 'pitchend', 'rotateend'];
events.forEach((event) => {
    map.on(event, () => {
        userInteracting = false;
        spinGlobe();
    })
})
  // When animation is complete, spin again
map.on('moveend', () => {
    spinGlobe();
});

const spinButton = document.getElementById('check1');
const spinText = document.querySelector('.spin')

spinButton.addEventListener('change', () => {
    spinEnabled = spinButton.checked;
    if (spinButton.checked) {
        spinGlobe();
        spinText.innerText = 'Spinning: On';
    } else {
        map.stop();
        spinText.innerText = 'Spinning: Off';
    }
})

})
