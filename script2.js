// JavaScript for page2.html (Photo and Video Gallery)

document.addEventListener('DOMContentLoaded', () => {
    console.log('Page 2 (Photo & Video Gallery) loaded successfully!');

    let isAdmin = sessionStorage.getItem('isAdmin') === 'true';

    // --- Header Back Arrow Functionality ---
    const backArrow = document.querySelector('.header-section .icon:first-child');
    if (backArrow) {
        backArrow.addEventListener('click', () => {
            sessionStorage.removeItem('isAdmin');
            window.history.back();
        });
    }

    // --- Image Zoom (Modal) Functionality ---
    const imageModal = document.getElementById('imageModal');
    const zoomedImage = document.getElementById('zoomedImage');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const galleryGrid = document.getElementById('gallery-grid');
    const photoUploadInput = document.getElementById('photo-upload');
    
    let galleryItems;
    let galleryImages;
    let currentIndex = 0;

    // --- Pinch-to-Zoom and Pan variables ---
    let initialPinchDistance = 0;
    let currentScale = 1;
    let isPinching = false;
    let initialScaleOnPinch = 1;
    let lastPanX = 0;
    let lastPanY = 0;
    let currentTranslateX = 0;
    let currentTranslateY = 0;

    let isSwipingDown = false;

    // Function to close the modal (reusable)
    function closeModal() {
        imageModal.classList.remove('show');
        document.body.style.overflow = 'auto';
        // Reset zoom and pan
        zoomedImage.style.transform = 'scale(1) translate(0px, 0px)';
        currentScale = 1;
        isPinching = false;
        currentTranslateX = 0;
        currentTranslateY = 0;
        // Remove filters
        zoomedImage.classList.remove('filter-bw', 'filter-sepia');
        imageModal.classList.remove('audio-reactive');
    }

    // Function to show a specific image in the modal
    function showImage(index) {
        galleryItems = document.querySelectorAll('.gallery-item');
        galleryImages = document.querySelectorAll('.gallery-item img.zoomable-image');
        
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
                showImage(index);
            } else {
                alert('Invalid password. Please try again.');
            }
            return;
        }

        if (index >= 0 && index < galleryImages.length) {
            currentIndex = index;
            const imgSrc = galleryImages[currentIndex].src;
            zoomedImage.src = imgSrc;
            imageModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            // Reset zoom for the new image
            zoomedImage.style.transform = 'scale(1) translate(0px, 0px)';
            currentScale = 1;
            currentTranslateX = 0;
            currentTranslateY = 0;
            imageModal.classList.add('audio-reactive');
        }
    }

    // Function to update the gallery view based on admin status
    function updateGalleryView() {
        galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach(item => {
            const isPrivate = item.hasAttribute('data-private');
            const img = item.querySelector('.sensitive-image');
            const cover = item.querySelector('.sensitive-cover');

            if (isPrivate) {
                if (isAdmin) {
                    if (img) img.style.display = 'block';
                    if (cover) cover.style.display = 'none';
                } else {
                    if (img) img.style.display = 'none';
                    if (cover) cover.style.display = 'flex';
                }
            }
        });
    }

    // Function to initialize event listeners for gallery items and download button
    function initializeGalleryItems() {
        galleryItems = document.querySelectorAll('.gallery-item');
        galleryImages = document.querySelectorAll('.gallery-item img.zoomable-image');
        
        galleryItems.forEach((item, index) => {
            // Re-assign listeners to prevent duplicates after DOM modifications
            const oldItem = item.cloneNode(true);
            item.parentNode.replaceChild(oldItem, item);
            item = oldItem;
            
            item.addEventListener('click', () => {
                showImage(index);
            });

            // Add download button functionality to each gallery item
            let downloadBtn = item.querySelector('.download-item-btn');
            if (!downloadBtn) {
                downloadBtn = document.createElement('button');
                downloadBtn.classList.add('download-item-btn');
                downloadBtn.innerHTML = 'Download';
                item.appendChild(downloadBtn);
            }
            // Removed mouse and touch listeners for hiding/showing the button

            downloadBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const imageUrl = item.querySelector('img.zoomable-image').src;
                const isPrivate = item.hasAttribute('data-private');
                const adminPassword = 'Gujjar@5757';

                if (isPrivate && !isAdmin) {
                    const password = prompt('This image contains sensitive information. Please enter the admin password:');
                    if (password === adminPassword) {
                        isAdmin = true;
                        sessionStorage.setItem('isAdmin', 'true');
                        alert('Admin verification successful! Sensitive images can now be downloaded.');
                        updateGalleryView();
                        initiateDownload(imageUrl);
                    } else {
                        alert('Invalid password. Please try again.');
                    }
                } else {
                    initiateDownload(imageUrl);
                }
            });
        });
    }

    // Function to handle the actual download logic
    async function initiateDownload(imageUrl) {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1) || 'download.jpg';
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            alert('Image has been downloaded!');
        } catch (error) {
            console.error('Error downloading the image:', error);
            alert('Failed to download the image. Please try again.');
        }
    }

    // Close modal via close button
    closeModalBtn.addEventListener('click', closeModal);

    // Close modal via tap/click on the overlay
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            closeModal();
        }
    });

    // --- Swipe and Pinch Gestures ---
    let touchStartY = 0;
    let filterIndex = 0;
    const filters = ['', 'filter-bw', 'filter-sepia'];

    imageModal.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            isPinching = true;
            initialPinchDistance = getPinchDistance(e.touches);
            initialScaleOnPinch = currentScale;
        } else if (e.touches.length === 1) {
            isPinching = false;
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
            lastPanX = e.touches[0].screenX;
            lastPanY = e.touches[0].screenY;
        }
    });

    imageModal.addEventListener('touchmove', (e) => {
        if (isPinching && e.touches.length === 2) {
            const newPinchDistance = getPinchDistance(e.touches);
            const pinchRatio = newPinchDistance / initialPinchDistance;
            const newScale = initialScaleOnPinch * pinchRatio;
            currentScale = Math.min(Math.max(1, newScale), 4);
            zoomedImage.style.transform = `scale(${currentScale}) translate(${currentTranslateX}px, ${currentTranslateY}px)`;
            e.preventDefault();
        } else if (e.touches.length === 1) {
            const touch = e.touches[0];
            const dy = touch.screenY - touchStartY;
            
            if (dy > 50 && currentScale === 1) {
                isSwipingDown = true;
                imageModal.style.transform = `translateY(${dy}px)`;
            } else if (currentScale > 1) {
                const dx = touch.screenX - lastPanX;
                const dyPan = touch.screenY - lastPanY;

                currentTranslateX += dx / currentScale;
                currentTranslateY += dyPan / currentScale;
                
                zoomedImage.style.transform = `scale(${currentScale}) translate(${currentTranslateX}px, ${currentTranslateY}px)`;

                lastPanX = touch.screenX;
                lastPanY = touch.screenY;
                e.preventDefault();
            }
        }
    });

    imageModal.addEventListener('touchend', (e) => {
        if (isPinching) {
            isPinching = false;
        } else if (isSwipingDown) {
            const swipeDistanceY = e.changedTouches[0].screenY - touchStartY;
            if (swipeDistanceY > 100) {
                closeModal();
            } else {
                imageModal.style.transform = 'translateY(0)';
            }
            isSwipingDown = false;
        } else {
            const swipeDistanceX = touchStartX - e.changedTouches[0].screenX;
            const swipeDistanceY = touchStartY - e.changedTouches[0].screenY;

            if (currentScale === 1) {
                if (Math.abs(swipeDistanceX) > 50) {
                    if (swipeDistanceX > 0) {
                        let nextIndex = (currentIndex + 1) % galleryImages.length;
                        showImage(nextIndex);
                    } else {
                        let prevIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
                        showImage(prevIndex);
                    }
                } else if (Math.abs(swipeDistanceY) > 50) {
                    filterIndex = (filterIndex + 1) % filters.length;
                    zoomedImage.className = 'modal-content-img';
                    zoomedImage.classList.add(filters[filterIndex]);
                }
            }
        }
    });

    function getPinchDistance(touches) {
        const dx = touches[0].screenX - touches[1].screenX;
        const dy = touches[0].screenY - touches[1].screenY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // --- Photo Upload Functionality ---
    if (photoUploadInput) {
        photoUploadInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const newDiv = document.createElement('div');
                    newDiv.classList.add('gallery-item');
                    const newImg = document.createElement('img');
                    newImg.src = e.target.result;
                    newImg.alt = "Uploaded Photo";
                    newImg.classList.add('zoomable-image');
                    newDiv.appendChild(newImg);
                    galleryGrid.appendChild(newDiv);
                    initializeGalleryItems();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // --- Page Load Animations ---
    initializeGalleryItems();
    galleryImages.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0) rotate(0deg)';
        }, index * 80 + 200);
    });
});
