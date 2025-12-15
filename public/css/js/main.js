import * as h from "../helpers.js";

(function($){
//all the variables for the register page 
let signupForm = $("#signup-form"), 
    firstName = $("#firstName"),
    lastName = $("#lastName"),
    email = $("#email"),
    username = $("#username"),
    password = $("#password"),
    confirmPassword = $("#confirmPassword"),
    bio = $("#bio"),
    picture = $("#picture"),
    privacy = $("#privacy"),
    error = $(".error"),
//all the variables for the settings page incl the ones above 
    settingsForm = $("#settings-form"),
    updated = $(".updated")
// //all the variables for the search landing and search results page incl the ones above 
//     searchLandingForm = $("#landing-search-form"),
//     searchQuery = $("#q"),
//     parkName = $("#park"),
//     rating = $("#rating")

if(signupForm.length){
    signupForm.on("submit", async function(event) {
        event.preventDefault();

        //resets error label
        error.prop("hidden", true).text("");

        //checking inputs
        try{ 
            //firstName
            firstName.val(h.checkValidString(firstName.val(), 2, 20, "First name"));
            if(!/^[A-Za-z]+$/.test(firstName.val())) throw "Error: First name can only have letters."

            //lastName
            lastName.val(h.checkValidString(lastName.val(), 2, 20, "Last name"));
            if(!/^[A-Za-z]+$/.test(lastName.val())) throw "Error: Last name can only have letters."

            //email
            email.val(h.checkValidEmail(email.val(), "Email address"));

            //password + if matching
            password.val(h.checkValidPassword(password.val(), 8, null, "Password"));
            if(password.val() !== confirmPassword.val()) throw "Error: passwords must be matching";

            //username
            username.val(h.checkValidString(username.val(), 2, 20, "Username"));

            //bio
            if(bio.val().trim() !== "") bio.val(h.checkValidString(bio.val(), 20, 255, "Bio"));

            //picture
            if(picture.val().trim() !== "") {
                let picFetch = await fetch(picture.val().trim())
                if(!picFetch.ok) throw "Error: not a valid picture url"
                else picture.val(picture.val().trim())
            }
            else picture.val("https://t3.ftcdn.net/jpg/06/33/54/78/360_F_633547842_AugYzexTpMJ9z1YcpTKUBoqBF0CUCk10.jpg")

            //privacy
            privacy.val(privacy.val().trim().toLowerCase());
            if(privacy.val() !== "private" && privacy.val() !== "public") throw "Error: privacy must only be 'private' or 'public'";

            //register the user if no errors have been thrown
            $.ajax({
                method: "POST",
                url: '/register',
                contentType: "application/json",
                data: JSON.stringify({
                    firstName: firstName.val(),
                    lastName: lastName.val(),
                    email: email.val(),
                    username: username.val(),
                    password: password.val(),
                    confirmPassword: confirmPassword.val(),
                    bio: bio.val(),
                    pic: picture.val(),
                    privacy: privacy.val()})
            }).then(function() {
                window.location.href = "/login";
            }).fail(function() {
                signupForm.trigger("reset");
                error.text("Failed to register user").prop("hidden", false);})            
        } catch(e) {
            signupForm.trigger("reset");
            error.text(e).prop("hidden", false);
        }

    })
}

if(settingsForm.length){
    settingsForm.on("submit", async function(event) {
        event.preventDefault();

        //resets error and updated label
        error.prop("hidden", true).text("");
        updated.prop("hidden", true).text("");

        //checking inputs
        try{ 
            //firstName
            if(firstName.val().trim() !== "") {
                firstName.val(h.checkValidString(firstName.val(), 2, 20, "First name"));
                if(!/^[A-Za-z]+$/.test(firstName.val())) throw "Error: First name can only have letters."}

            //lastName
            if(lastName.val().trim() !== "") {
                lastName.val(h.checkValidString(lastName.val(), 2, 20, "Last name"));
                if(!/^[A-Za-z]+$/.test(lastName.val())) throw "Error: Last name can only have letters."}

            //email
            if(email.val().trim() !== "") email.val(h.checkValidEmail(email.val(), "Email address"));

            //password + if matching
            if(password.val().trim() !== ""){
                password.val(h.checkValidPassword(password.val(), 8, null, "Password"));
                if(password.val() !== confirmPassword.val()) throw "Error: passwords must be matching";}

            //username
            if(username.val().trim() !== "") username.val(h.checkValidString(username.val(), 2, 20, "Username"));

            //bio
            if(bio.val().trim() !== "") bio.val(h.checkValidString(bio.val(), 20, 255, "Bio"));

            //picture
            if(picture.val().trim() !== "") {
                let picFetch = await fetch(picture.val().trim())
                if(!picFetch.ok) throw "Error: not a valid picture url"
                else picture.val(picture.val().trim())
            }
            
            //privacy
            if(privacy.val().trim() !=="") {
                privacy.val(privacy.val().trim().toLowerCase());
                if(privacy.val() !== "private" && privacy.val() !== "public") throw "Error: privacy must only be 'private' or 'public'";}

            //updates the settings if no errors have been thrown
            $.ajax({
                method: "POST",
                url: settingsForm.attr("action"),
                contentType: "application/json",
                data: JSON.stringify({
                    newFirst: firstName.val(),
                    newLast: lastName.val(),
                    newEmail: email.val(),
                    newUsername: username.val(),
                    newPassword: password.val(),
                    newConfirmPassword: confirmPassword.val(),
                    newBio: bio.val(),
                    newPic: picture.val(),
                    newPrivacy: privacy.val()})
            }).then(function() {
                updated.text("Updated settings.").prop("hidden", false);
                window.location.href = "/settings";
            }).fail(function() {
                settingsForm.trigger("reset");
                error.text("Failed to update user settings.").prop("hidden", false);})            
        } catch(e) {
            settingsForm.trigger("reset");
            error.text(e).prop("hidden", false);
        }
    })
}

// if(searchLandingForm.length){
//     searchLandingForm.on("submit", function(event) {
//         event.preventDefault();

//         error.prop("hidden", true).text("");

//         //checking inputs
//         try { 
//             searchQuery.val(h.checkValidString(searchQuery.val(), 2, 20, "Search Query"));
//             if(!/^[A-Za-z ]+$/.test(searchQuery.val())) throw "Error: Search query can only have letters."
            
//             if(parkName.val().trim() !== "") parkName.val(h.checkValidString(parkName.val(),2,50,"Park Name"));

//             if(rating.val().trim() !== "" && rating.val() !== "Select") rating.val(h.checkValidNumber(rating.val(),1,5,"Rating"));
        
//         $.ajax({
//                 method: "POST",
//                 url: searchLandingForm.attr("action"),
//                 contentType: "application/json",
//                 data: JSON.stringify({
//                     q: searchQuery.val(),
//                     park: parkName.val(),
//                     rating: rating.val()})
//             }).then(function() {
//                 window.location.assign(res.redirectTo);
//             }).fail(function() {
//                 searchLandingForm.trigger("reset");
//                 error.text("Failed to search fountains.").prop("hidden", false);})            
//         } catch(e) {
//             searchLandingForm.trigger("reset");
//             error.text(e).prop("hidden", false);
//         }
//     })
// }

// Login form validation
const loginForm = $('#login-form');

if (loginForm.length) {
  loginForm.on('submit', function (event) {
    event.preventDefault();

    // remove any old error messages
    $('.error').remove();

    let errors = {};

    let username = $('#username').val().trim();
    let password = $('#password').val();

    // validate username
    try {
      username = h.checkValidString(username, 2, 20, 'Username');
    } catch (e) {
      errors.username = e;
    }

    // validate password
    try {
      password = h.checkValidPassword(password, 8, null, 'Password');
    } catch (e) {
      errors.password = e;
    }

    // show any errors right under the corresponding inputs
    if (errors.username) {
      $('<p>')
        .addClass('error')
        .text(errors.username)
        .insertAfter('#username');
    }

    if (errors.password) {
      $('<p>')
        .addClass('error')
        .text(errors.password)
        .insertAfter('#password');
    }

    // if no errors, allow the normal POST /login to go through
    if (Object.keys(errors).length === 0) {
      event.target.submit();
    }
  });
}

// Form validation for review form (fountainDetails page)
const reviewForm = $("#review-form");
  const reviewError = $("#review-error");

  if (reviewForm.length) {
    reviewForm.on("submit", function (event) {
      event.preventDefault();

      // clear previous error
      reviewError.text("").prop("hidden", true);

      try {
        // pull values
        let taste = $("#taste").val();
        let location = $("#location").val();
        let pressure = $("#pressure").val();
        let cleanliness = $("#cleanliness").val();
        let accessibility = $("#accessibility").val();
        let reviewText = $("#reviewText").val();
        let operationalChecked = $("#operational").is(":checked");

        // convert to numbers
        taste = Number(taste);
        location = Number(location);
        pressure = Number(pressure);
        cleanliness = Number(cleanliness);
        accessibility = Number(accessibility);

        // basic checks before calling helpers
        if (Number.isNaN(taste)) throw "Taste rating must be a number.";
        if (Number.isNaN(location)) throw "Location rating must be a number.";
        if (Number.isNaN(pressure)) throw "Pressure rating must be a number.";
        if (Number.isNaN(cleanliness)) throw "Cleanliness rating must be a number.";
        if (Number.isNaN(accessibility)) throw "Accessibility rating must be a number.";

        // range checks using your helper
        h.checkValidNumber(taste, 1, 5, "Taste");
        h.checkValidNumber(location, 1, 5, "Location");
        h.checkValidNumber(pressure, 1, 5, "Pressure");
        h.checkValidNumber(cleanliness, 1, 5, "Cleanliness");
        h.checkValidNumber(accessibility, 1, 5, "Accessibility");

        // review text: 20–255 chars
        reviewText = h.checkValidString(reviewText, 20, 255, "Review content");

        // operational: require that the user checks the box
        if (!operationalChecked) {
          throw "Please mark this fountain as working by checking the box.";
        }

        // build payload for the POST /fountain/:id route
        const payload = {
          taste: taste,
          location: location,
          pressure: pressure,
          cleanliness: cleanliness,
          accessibility: accessibility,
          operational: true, // because box is checked
          reviewText: reviewText,
        };

        const actionUrl = reviewForm.attr("action");

        $.ajax({
          method: "POST",
          url: actionUrl,
          contentType: "application/json",
          data: JSON.stringify(payload),
        })
          .then(function () {
            // on success, just reload the page so new review shows up
            window.location.reload();
          })
          .fail(function () {
            // simple error message on failure
            reviewError.text("Failed to submit review. Please try again.").prop("hidden", false);
          });
      } catch (e) {
        reviewError.text(e).prop("hidden", false);
      }
    });
  }

})(window.jQuery);