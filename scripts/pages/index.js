import { supabase } from '../utils/supabaseClient.js'

document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", async(e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
    
        const { data: authData, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            
            if (error) {
                alert('Sign-up error: ' + error.message);
                return;
            } 
            window.location.href = '../../pages/globe.html'
    })

})
