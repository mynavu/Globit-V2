

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

    //COUNTRIES
    const { data: countryList, error: countryListError } = await supabase
        .from('posts')
        .select('country')
        .eq('user_id', userID);

    const countryFrequency = new Map();
    
    countryList.forEach(country => {
        country = country.country;
        if (countryFrequency.has(country)) {
            countryFrequency.set(country, countryFrequency.get(country) + 1)
        } else {
            countryFrequency.set(country, 1)
        }
    })

    console.log(countryFrequency);

    let maxCount = 0;
    let maxCountry;
    for (const [country, count] of countryFrequency) {
        if (count > maxCount) {
            maxCount = count;
            maxCountry = country;
        }
    }

    console.log("maxCount", maxCount, "maxCountry", maxCountry);
    



    //STAMPS
    const { data: stampList, error: stampListError } = await supabase
        .from('posts')
        .select('stamp')
        .eq('user_id', userID)

});