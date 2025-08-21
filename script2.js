// JavaScript for page2.html (Photo and Video Gallery)

document.addEventListener('DOMContentLoaded', () => {
    console.log('Page 2 (Photo & Video Gallery) loaded successfully!');

    // Check if the user is an admin from session storage
    let isAdmin = sessionStorage.getItem('isAdmin') === 'true';

    // --- Header Back Arrow Functionality ---
    const backArrow = document.querySelector('.header-section .icon:first-child');
    if (backArrow) {
        backArrow.addEventListener('click', () => {
            // Clear admin session flag when going back to login
            sessionStorage.removeItem('isAdmin');
            window.history.back(); // Go back to the previous page (login page)
        });
    }

    // --- Image Zoom (Modal) Functionality ---
    const imageModal = document.getElementById('imageModal');
    const zoomedImage = document.getElementById('zoomedImage');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const galleryImages = document.querySelectorAll('.gallery-item img.zoomable-image');
    const downloadImageBtn = document.getElementById('downloadImageBtn');
    
    // --- Gemini API elements ---
    const generateCaptionBtn = document.getElementById('generateCaptionBtn');
    const captionDisplay = document.getElementById('captionDisplay');
    const captionLoading = document.getElementById('captionLoading');

    // --- Admin Verification elements ---
    const adminVerifyBtn = document.getElementById('adminVerifyBtn');

    let currentIndex = 0; // Track the current image index

    // --- Pinch-to-Zoom and Pan variables ---
    let initialPinchDistance = 0;
    let currentScale = 1;
    let isPinching = false;

    // Function to close the modal (reusable)
    function closeModal() {
        imageModal.classList.remove('show');
        document.body.style.overflow = 'auto';
        captionDisplay.textContent = '';
        captionLoading.classList.add('hidden');
        downloadImageBtn.classList.add('hidden'); // Hide the download button when modal is closed
        // Reset zoom and pan
        zoomedImage.style.transform = 'scale(1)';
        currentScale = 1;
        isPinching = false;
    }

    // Function to show a specific image in the modal
    function showImage(index) {
        const item = galleryItems[index];
        const isPrivate = item.hasAttribute('data-private');
        const adminPassword = 'Gujjar@5757';

        if (isPrivate && !isAdmin) {
            const password = prompt('This image contains sensitive information. Please enter the admin password:');
            if (password === adminPassword) {
                isAdmin = true;
                sessionStorage.setItem('isAdmin', 'true');
                alert('Admin verification successful! Sensitive images are now visible.');
                updateGalleryView();
                // Re-call the function to show the now-accessible image
                showImage(index);
            } else {
                alert('Invalid password. Please try again.');
            }
            return; // Exit the function after the prompt
        }

        if (index >= 0 && index < galleryImages.length) {
            currentIndex = index;
            const imgSrc = galleryImages[currentIndex].src;
            zoomedImage.src = imgSrc;
            imageModal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            downloadImageBtn.classList.remove('hidden'); // Show the download button
        }
    }

    // Navigate to the next image
    function showNextImage() {
        showImage((currentIndex + 1) % galleryImages.length);
    }

    // Navigate to the previous image
    function showPrevImage() {
        showImage((currentIndex - 1 + galleryImages.length) % galleryImages.length);
    }

    // Function to update the gallery view based on admin status
    function updateGalleryView() {
        galleryItems.forEach(item => {
            const isPrivate = item.hasAttribute('data-private');
            const img = item.querySelector('.sensitive-image');
            const cover = item.querySelector('.sensitive-cover');

            if (isPrivate) {
                if (isAdmin) {
                    // Show image and hide cover for admin
                    if (img) img.style.display = 'block';
                    if (cover) cover.style.display = 'none';
                } else {
                    // Hide image and show cover for non-admin
                    if (img) img.style.display = 'none';
                    if (cover) cover.style.display = 'flex';
                }
            }
        });
    }

    // Event listeners for each image
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            showImage(index);
        });
    });

    // Close modal via close button
    closeModalBtn.addEventListener('click', closeModal);

    // Close modal via tap/click on the overlay
    imageModal.addEventListener('click', (e) => {
        // Exclude the zoomed image itself from closing the modal
        if (e.target === imageModal) {
            closeModal();
        }
    });

    // --- Admin Verification Button Functionality ---
    if (adminVerifyBtn) {
        adminVerifyBtn.addEventListener('click', () => {
            const password = prompt('Please enter the admin password:');
            // Hardcoded admin password from script.js
            const adminPassword = 'Gujjar@5757'; 

            if (password === adminPassword) {
                isAdmin = true;
                sessionStorage.setItem('isAdmin', 'true');
                alert('Admin verification successful! Sensitive images are now visible.');
                updateGalleryView(); // Update the gallery to show the images
            } else {
                alert('Invalid password. Please try again.');
            }
        });
    }

    // --- Swipe Gestures ---
    let touchStartX = 0;
    let touchEndX = 0;

    imageModal.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            // Pinch-to-zoom starts
            isPinching = true;
            initialPinchDistance = getPinchDistance(e.touches);
        } else if (e.touches.length === 1) {
            // Single touch for swipe
            isPinching = false;
            touchStartX = e.changedTouches[0].screenX;
        }
    });

    imageModal.addEventListener('touchmove', (e) => {
        if (isPinching && e.touches.length === 2) {
            const newPinchDistance = getPinchDistance(e.touches);
            const pinchRatio = newPinchDistance / initialPinchDistance;
            currentScale = pinchRatio;
            zoomedImage.style.transform = `scale(${currentScale})`;
        }
    });

    imageModal.addEventListener('touchend', (e) => {
        if (isPinching) {
            // End of pinch gesture, reset
            isPinching = false;
            initialPinchDistance = 0;
        } else {
            // End of swipe gesture
            touchEndX = e.changedTouches[0].screenX;
            handleSwipeGesture();
        }
    });

    function getPinchDistance(touches) {
        const dx = touches[0].screenX - touches[1].screenX;
        const dy = touches[0].screenY - touches[1].screenY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function handleSwipeGesture() {
        const swipeDistance = touchStartX - touchEndX;
        if (Math.abs(swipeDistance) > 50) { // Check for a significant swipe
            if (swipeDistance > 0) {
                showNextImage();
            } else {
                showPrevImage();
            }
        }
    }

    // --- Gemini API Call for Caption Generation ---
    generateCaptionBtn.addEventListener('click', async () => {
        captionLoading.classList.remove('hidden');
        captionDisplay.textContent = 'Generating caption...';
        const imageUrl = zoomedImage.src;

        try {
            const response = await fetch('/your-gemini-api-endpoint', { // Replace with your actual API endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    imageUrl: imageUrl
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Gemini API Error:', errorData);
                captionDisplay.textContent = 'Error generating caption. Please try again.';
                return;
            }

            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                captionDisplay.textContent = text;
            } else {
                captionDisplay.textContent = 'Could not generate a caption.';
                console.warn('Gemini API response format unexpected:', result);
            }
        } catch (error) {
            console.error('Error fetching caption from Gemini API:', error);
            captionDisplay.textContent = 'Failed to connect to caption service.';
        } finally {
            captionLoading.classList.add('hidden');
        }
    });

    // --- Image Download Functionality ---
    downloadImageBtn.addEventListener('click', async () => {
        const imageUrl = zoomedImage.src;
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            // Get the filename from the URL, or use a default
            const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1) || 'download.jpg';
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading the image:', error);
            alert('Failed to download the image. Please try again.');
        }
    });

    // --- Page Load Animations (Staggered Gallery Item Fade-in) ---
    // Update view on page load
    updateGalleryView();
    galleryImages.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 80);
    });
});