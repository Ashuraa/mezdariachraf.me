// Variable to hold the YouTube player instance
let player;

/**
* Function to create and manage the YouTube player instance using YouTube IFrame API
*/
window.onYouTubeIframeAPIReady = function() {
    setPlayer();
}

function setPlayer(){
    player = new YT.Player('projectPlayer', {
        videoId: 'cBkQOML-TDU',
        events: {
            'onReady': onPlayerReady
        }
    });
}

/**
* Plays the video when the player is ready.
* @param {Object} event - The event object from the YouTube player API.
*/
function onPlayerReady(event) {
    console.log('YouTube IFrame API is ready');
    // Can start the video automatically if needed (optional)
    // event.target.playVideo();
}

// Variable to check if the project is open
var isProjectOpen = false;

// Variable to track if dragging is occurring
var isDragging = false;

// Owl carousel selector
var owl = $('.owl-carousel');

// Sleep function to add delays (returns a Promise)
const sleep = duration => new Promise(r => setTimeout(r, duration));

// Variable to hold active cards
var activeCards;

// Fetch project data from JSON file
var data = $.getJSON("Data/DataProject.json", function() {
    console.log("Success getting portfolio data project.");
}).fail(function(jqXHR, textStatus, errorThrown) {
    console.log('Portfolio Data project request failed! ' + textStatus);
});

// jQuery ready function to initialize when the DOM is fully loaded
$(document).ready(function(){
    
    // Hide the header section initially
    $(".HeaderHide").hide();
    
    // Call a function to apply some option filters
    OptionGooFilter();
    
    // Initialize Owl carousel with settings
    owl.owlCarousel({
        items: 4,
        loop: true,
        margin: 30,
        autoplay: true,
        autoplayTimeout: 3000,
        autoplayHoverPause: true, 
        autoplaySpeed: 2000,
        nav: false,
        dots: false,
        mouseDrag: true,
        touchDrag: true,
        pullDrag: false,
        responsiveClass: true,
        responsive: {
            0: { items: 1 }, // 1 item for small screens
            600: { items: 3 }, // 3 items for medium screens
            1000: { items: 4 } // 4 items for large screens
        }
    });
    
    // Set flag when dragging starts on Owl carousel
    owl.on('drag.owl.carousel', function(event) {
        isDragging = true;
    });
    
    // Reset dragging flag after drag is complete, with a delay
    owl.on('dragged.owl.carousel', async function(event) {
        await sleep(200);
        isDragging = false;
    });

    owl.on('resized.owl.carousel', function(event) {
        owl.trigger('stop.owl.autoplay');
    })

    // Event listener for closing the project on header click
    $('.HeaderHide').click(function() {
        if (isProjectOpen) {
            document.getElementById("project").style.zIndex = "0"; // Lower project z-index
            showProject(false, '-100%', '10000px'); // Hide the project content
            rotateAnimation($('.cross-1'), 0, 0); // Reset cross icon animation
            rotateAnimation($('.cross-2'), 0, 0); 
            $(".HeaderHide").hide(); // Hide the header
            animateItemsThenContainer('55%', '48%'); // Animate items and container
            animateItem('0%', true); // Reset item animation
        }
    });
    
});

function OptionGooFilter() 
{
    var checkBox = document.getElementById("perf");
    
    var menu = document.getElementsByClassName("menu");
    
    if (checkBox.checked == true){
        menu[0].style.webkitFilter  = "none";
    } else {
        menu[0].style.webkitFilter  = "url('#shadowed-goo')";
    }
} 

/**
* Opens a project by displaying the video and description associated with it,
* only if no other project is open and the carousel is not being dragged.
* 
* This function stops the carousel autoplay, extracts the project ID from the clicked element,
* and updates the video player and description with the corresponding project details from the data.
* It also animates the project opening by rotating icons and adjusting the layout.
* 
* @param {Object} element - The DOM element that triggered the open event (jQuery object).
*/
function OpenProject(element) {
    // Check if a project is already open or if dragging is happening
    if (!isProjectOpen && !isDragging) {
        // Bring the project layer to the front
        document.getElementById("project").style.zIndex = "50";
        
        // Stop autoplay when a project is opened
        owl.trigger('stop.owl.autoplay');
        
        // Get active cards
        activeCards = $(".active");
        
        // Extract project ID from the clicked element's ID (assuming it's in the format "project_ID")
        var id = $(element).attr('id').replace('project_', '');
        
        // Check if player is initialized and load the video
        if (player && player.loadVideoById) {
            player.cueVideoById(data.responseJSON[id].video);
        }
        
        // Clear and update the project description
        //$(".description").empty();
        let container = document.getElementById('description');
        container.innerHTML = data.responseJSON[id].description;
        
        // Show the header hide button
        $(".HeaderHide").show();
        
        // Animate the cross icons to form an 'X' indicating the project is open
        rotateAnimation($('.cross-1'), 45, 200); // Rotate first part of cross
        rotateAnimation($('.cross-2'), -45, 200); // Rotate second part of cross
        
        // Set the project open flag to true
        isProjectOpen = true;
        
        // Animate items (e.g., cards) and adjust the container
        animateItem('200%', false);
        animateItemsThenContainer('67%', '33%');
        
        // Display the project by adjusting the positions of the video and description containers
        showProject(true, '0%', '1000px');
    }
}

/**
* Rotates an element to a specified degree over a given duration.
* 
* @param {Object} element - The DOM element to rotate (jQuery object).
* @param {number} degree - The degree to which the element should rotate.
* @param {number} animDuration - The duration of the animation in milliseconds.
*/
function rotateAnimation(element, degree, animDuration){
    $(element).animate({ deg: degree },
        {
            duration: animDuration,
            step: function(now) {
                $(this).css({ transform: 'rotate(' + now + 'deg)' });
            }
        });
    }
    
    /**
    * Animates a specific card element by moving it vertically.
    * 
    * @param {number} divNumber - The index of the card in the activeCards array to animate.
    * @param {string} topPercent - The vertical position in percentage (e.g., '0%', '100%').
    * @returns {Promise} - A promise that resolves when the animation completes.
    */
    function itemToAnimate(divNumber, topPercent) {
        return $(activeCards[divNumber]).delay(20).animate({
            top: topPercent
        }, 100).promise()
    }
    
    /**
    * Animates all active cards and optionally waits for container animation.
    * 
    * @param {string} topPercent - The vertical position for the cards (e.g., '0%', '100%').
    * @param {boolean} waitForContainer - Whether to wait for the container animation before proceeding.
    * @returns {Promise<void>} - A promise that resolves when all animations are complete.
    */
    async function animateItem(topPercent, waitForContainer) {
        if (waitForContainer)
            await animateItemsThenContainer();
        
        owl.trigger('stop.owl.autoplay'); // Stop autoplay during the animation
        
        await sleep(100); // Small delay for settling
        for (let i = 0; i < activeCards.length; i++) {
            await itemToAnimate(i, topPercent); // Animate each card
        }
        
        owl.trigger('stop.owl.autoplay'); // Ensure autoplay remains stopped because unhover replay it
        
        if (waitForContainer) {
            isProjectOpen = false; // Mark project as closed
            await sleep(50); // Small delay
            owl.trigger('play.owl.autoplay', [3000]); // Resume autoplay
        }
    }
    
    /**
    * Animates active items and adjusts the container's size and position.
    * 
    * @param {string} heightValue - The new height value of the container (e.g., '55%').
    * @param {string} topValue - The new top value of the container (e.g., '33%').
    * @returns {Promise<void>} - A promise that resolves when the container's animation is complete.
    */
    async function animateItemsThenContainer(heightValue, topValue) {
        await animateItem(); // Animate all items first
        $('.scroll-content').animate({ height: heightValue, top: topValue }, 500); // Animate container height and positio
    }
    
    /**
    * Shows or hides the project content, including video player and description.
    * 
    * @param {boolean} show - Whether to show or hide the project.
    * @param {string} videoPos - Position of the video player (left offset).
    * @param {string} descPos - Position of the description (left offset).
    */
    async function showProject(show, videoPos, descPos) {
        if (show) {
            await animateItemsThenContainer(); // Optionally wait for container animation
        } else {
            // Stop the video using the YouTube Player API
            if (player && player.stopVideo) {
                player.stopVideo(); // This will stop the video completely
            }
        }
        
        await sleep(500);
        $('#projectPlayer').animate({ left: videoPos }, 500); // Animate video player position
        $('.description').animate({ left: descPos }, 500); // Animate description position
    }
    
    
    