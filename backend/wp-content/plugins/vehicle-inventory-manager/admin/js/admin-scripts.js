/**
 * Vehicle Inventory Manager - Admin Scripts
 */

(function($) {
    'use strict';
    
    $(document).ready(function() {
        
        // Gallery management
        var vimGalleryFrame;
        var vimGalleryImages = [];
        
        // Initialize gallery images from hidden field
        var galleryInput = $('#vim_gallery_images');
        if (galleryInput.val()) {
            vimGalleryImages = galleryInput.val().split(',').map(function(id) {
                return parseInt(id);
            });
        }
        
        // Add gallery images
        $('#vim-add-gallery-images').on('click', function(e) {
            e.preventDefault();
            
            // Create media frame if it doesn't exist
            if (vimGalleryFrame) {
                vimGalleryFrame.open();
                return;
            }
            
            vimGalleryFrame = wp.media({
                title: vimAdmin.strings.uploadImage,
                button: {
                    text: vimAdmin.strings.uploadImage
                },
                multiple: true
            });
            
            // When images are selected
            vimGalleryFrame.on('select', function() {
                var selection = vimGalleryFrame.state().get('selection');
                
                selection.each(function(attachment) {
                    attachment = attachment.toJSON();
                    
                    // Add to array if not already present
                    if (vimGalleryImages.indexOf(attachment.id) === -1) {
                        vimGalleryImages.push(attachment.id);
                        
                        // Add to display
                        var imageHtml = '<div class="vim-gallery-item" data-id="' + attachment.id + '">';
                        imageHtml += '<img src="' + attachment.sizes.thumbnail.url + '" alt="">';
                        imageHtml += '<button type="button" class="vim-remove-image button">&times;</button>';
                        imageHtml += '</div>';
                        
                        $('#vim-gallery-container').append(imageHtml);
                    }
                });
                
                // Update hidden field
                updateGalleryInput();
            });
            
            vimGalleryFrame.open();
        });
        
        // Remove gallery image
        $(document).on('click', '.vim-remove-image', function(e) {
            e.preventDefault();
            
            if (confirm(vimAdmin.strings.confirmDelete)) {
                var $item = $(this).closest('.vim-gallery-item');
                var imageId = parseInt($item.data('id'));
                
                // Remove from array
                var index = vimGalleryImages.indexOf(imageId);
                if (index > -1) {
                    vimGalleryImages.splice(index, 1);
                }
                
                // Remove from display
                $item.remove();
                
                // Update hidden field
                updateGalleryInput();
            }
        });
        
        // Make gallery sortable
        $('#vim-gallery-container').sortable({
            items: '.vim-gallery-item',
            cursor: 'move',
            update: function() {
                // Update array based on new order
                vimGalleryImages = [];
                $('#vim-gallery-container .vim-gallery-item').each(function() {
                    vimGalleryImages.push(parseInt($(this).data('id')));
                });
                
                // Update hidden field
                updateGalleryInput();
            }
        });
        
        // Update gallery input field
        function updateGalleryInput() {
            galleryInput.val(vimGalleryImages.join(','));
        }
        
        // --- Make-Model Dependency in Admin ---
        // Listen for changes on Make radio buttons
        var $makeInputs = $('input[name="tax_input[vehicle_make][]"]');
        var $modelInputs = $('input[name="tax_input[vehicle_model][]"]');
        var $modelTabs = $('#vehicle_model-tabs .tabs');
        
        if ($makeInputs.length && $modelInputs.length) {
            
            // Function to filter models
            function filterModels(makeId) {
                // Reset model selection
                $('input[name="tax_input[vehicle_model][]"][value="0"]').prop('checked', true);
                
                // If no make selected (or None selected), show all or hide all?
                // Let's decide: Hide all specific models, only show "None"
                if (!makeId || makeId === '0') {
                    $modelTabs.each(function() {
                        var $input = $(this).find('input');
                        if ($input.val() === '0') {
                            $(this).show();
                        } else {
                            $(this).hide();
                        }
                    });
                    return;
                }
                
                // Show matching models
                $modelTabs.each(function() {
                    var $input = $(this).find('input');
                    var val = $input.val();
                    var parentId = $(this).data('parent-id');
                    
                    if (val === '0') {
                         $(this).show(); // Always show 'None'
                    } else if (String(parentId) === String(makeId)) {
                        $(this).show();
                    } else {
                        $(this).hide();
                    }
                });
            }
            
            // Initial run
             var checkedMake = $makeInputs.filter(':checked').val();
            filterModels(checkedMake);
            
            // Change event
            $makeInputs.on('change', function() {
                var makeId = $(this).val();
                filterModels(makeId);
            });
        }
        
    });
    
})(jQuery);
