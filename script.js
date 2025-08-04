// Google Keep Clone JavaScript

class GoogleKeepApp {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('keepNotes')) || [];
        this.currentNote = null;
        this.lastTap = 0;
        this.lineItems = []; // Array to track all line items
        this.nextLineId = 0;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadCurrentNote();
        this.setupPWA();
        this.setupInputTypeSwitching();
    }

    bindEvents() {
        // Title input
        const titleInput = document.querySelector('.title-input');
        titleInput.addEventListener('input', () => this.saveCurrentNote());
        
        // Note: line input events are handled in setupLineEvents for each individual line

        // Toolbar buttons
        this.bindToolbarButtons();
        


        // Auto-save on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveCurrentNote();
            }
        });

        // Auto-save before unload
        window.addEventListener('beforeunload', () => {
            this.saveCurrentNote();
        });
    }

    bindToolbarButtons() {
        const toolbarButtons = document.querySelectorAll('.toolbar-button');
        
        toolbarButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                this.handleToolbarAction(index);
            });
        });

        // Back button
        const backButton = document.querySelector('.back-button');
        backButton.addEventListener('click', () => {
            this.saveCurrentNote();
            // In a real app, this would navigate back
            console.log('Navigate back');
        });

        // Header icons
        const headerIcons = document.querySelectorAll('.header-icon');
        headerIcons.forEach((icon, index) => {
            icon.addEventListener('click', () => {
                this.handleHeaderAction(index);
            });
        });
    }



    handleToolbarAction(index) {
        switch (index) {
            case 0: // Add (plus icon) - create new line
                this.createNewLine();
                break;
            case 1: // More options (three dots)
                this.showMoreOptions();
                break;
            case 2: // Text formatting
                this.toggleTextFormat();
                break;
            case 3: // Undo
                this.undo();
                break;
            case 4: // Redo
                this.redo();
                break;
            case 5: // More options (right side)
                this.showNoteOptions();
                break;
        }
    }

    handleHeaderAction(index) {
        switch (index) {
            case 0: // Desktop view
                console.log('Desktop view');
                break;
            case 1: // Upload
                console.log('Upload');
                break;
            case 2: // Download
                this.downloadNote();
                break;
        }
    }

    // addListItem function removed - now handled by per-line input system

    showMoreOptions() {
        // Simple alert for demo - in real app would show menu
        console.log('More options');
    }

    toggleTextFormat() {
        // Visual feedback for text formatting
        const formatButton = document.querySelector('.text-format');
        formatButton.classList.toggle('active');
        console.log('Text format toggled');
    }

    undo() {
        // Simple implementation - in real app would have command history
        document.execCommand('undo');
    }

    redo() {
        // Simple implementation - in real app would have command history
        document.execCommand('redo');
    }

    showNoteOptions() {
        console.log('Note options');
    }

    downloadNote() {
        const title = document.querySelector('.title-input').value || 'Untitled';
        
        // Sync line items and get content from the new per-line system
        this.syncLineItemsWithDOM();
        let content = '';
        
        this.lineItems.forEach(lineItem => {
            if (lineItem.content.trim()) {
                if (lineItem.inputType === 'checkbox') {
                    content += `${lineItem.checked ? '✓' : '☐'} ${lineItem.content}\n`;
                } else if (lineItem.inputType === 'bullet') {
                    content += `• ${lineItem.content}\n`;
                } else {
                    content += `${lineItem.content}\n`;
                }
            }
        });
        
        const noteText = `${title}\n\n${content}`;
        const blob = new Blob([noteText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.txt`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    // Placeholder for the updated save/load functions below

    setupPWA() {
        // Register service worker if available
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        }

        // Handle install prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            // Show install button (you could add this to UI)
        });

        // Handle app install
        window.addEventListener('appinstalled', (evt) => {
            console.log('App installed');
        });
    }

    saveCurrentNote() {
        const title = document.querySelector('.title-input').value;
        
        // Sync lineItems with current DOM state
        this.syncLineItemsWithDOM();
        
        // Collect line items from the new per-line system
        const noteData = {
            lineItems: this.lineItems.map(lineItem => ({
                id: lineItem.id,
                inputType: lineItem.inputType,
                content: lineItem.content,
                checked: lineItem.checked || false
            }))
        };
        
        const content = JSON.stringify(noteData);
        
        if (!title && noteData.lineItems.length === 0) return;

        const note = {
            id: this.currentNote?.id || Date.now(),
            title: title || 'Untitled',
            content: content,
            lastModified: new Date().toISOString(),
            created: this.currentNote?.created || new Date().toISOString()
        };

        // Update existing note or add new one
        const existingIndex = this.notes.findIndex(n => n.id === note.id);
        if (existingIndex >= 0) {
            this.notes[existingIndex] = note;
        } else {
            this.notes.unshift(note);
        }

        this.currentNote = note;
        localStorage.setItem('keepNotes', JSON.stringify(this.notes));
    }

    loadCurrentNote() {
        // Load the most recent note or create new one
        if (this.notes.length > 0) {
            this.currentNote = this.notes[0];
            document.querySelector('.title-input').value = this.currentNote.title || '';
            
            try {
                const noteData = JSON.parse(this.currentNote.content || '{"lineItems":[]}');
                
                // Clear existing lines
                this.lineItems = [];
                this.nextLineId = 0;
                
                const linesContainer = document.querySelector('.lines-container');
                if (linesContainer) {
                    linesContainer.innerHTML = '';
                }
                
                // Restore line items
                if (noteData.lineItems && noteData.lineItems.length > 0) {
                    noteData.lineItems.forEach(lineData => {
                        const lineWrapper = this.createNewLine();
                        lineWrapper.dataset.inputType = lineData.inputType || 'text';
                        
                        // Find the line in lineItems and update it
                        const lineId = parseInt(lineWrapper.dataset.lineId);
                        const lineItem = this.lineItems.find(item => item.id === lineId);
                        if (lineItem) {
                            lineItem.inputType = lineData.inputType || 'text';
                            lineItem.content = lineData.content || '';
                            lineItem.checked = lineData.checked || false;
                        }
                        
                        // Update the display for this line
                        this.updateLineDisplay(lineWrapper, lineData.inputType || 'text');
                        
                        // Set the content
                        const textInput = lineWrapper.querySelector('.line-text-input, .checkbox-item-text, .bullet-item-text');
                        if (textInput) {
                            textInput.value = lineData.content || '';
                            // Update drag handle visibility after setting content
                            this.updateDragHandleVisibility(lineWrapper, textInput);
                        }
                        
                        // Set checkbox state
                        if (lineData.inputType === 'checkbox' && lineData.checked) {
                            const checkbox = lineWrapper.querySelector('input[type="checkbox"]');
                            if (checkbox) {
                                checkbox.checked = true;
                                lineWrapper.querySelector('.checkbox-item').classList.add('completed');
                            }
                        }
                    });
                } else {
                    // Create initial empty line if no saved content
                    this.createNewLine();
                }
            } catch (e) {
                console.error('Error loading note:', e);
                // Create initial empty line on error
                this.createNewLine();
            }
        } else {
            // No notes exist, create initial line
            this.createNewLine();
        }
    }

    // loadStructuredContent function removed - now handled by loadCurrentNote in per-line system

    setupInputTypeSwitching() {
        // Replace the original content area with line-based system
        this.createInitialLine();
    }

    createInitialLine() {
        const noteContent = document.querySelector('.note-content');
        
        // Completely remove original inputs
        const contentTextarea = document.querySelector('.content-textarea');
        const checkboxContainer = document.querySelector('.checkbox-container');
        const bulletContainer = document.querySelector('.bullet-container');
        
        if (contentTextarea) contentTextarea.remove();
        if (checkboxContainer) checkboxContainer.remove();
        if (bulletContainer) bulletContainer.remove();
        
        // Create the main container for all lines
        let linesContainer = document.querySelector('.lines-container');
        if (!linesContainer) {
            linesContainer = document.createElement('div');
            linesContainer.className = 'lines-container';
            noteContent.appendChild(linesContainer);
        }
        
        // Create first line if none exist
        if (this.lineItems.length === 0) {
            this.createNewLine(null);
        }
    }

    createNewLine(afterElement = null) {
        const linesContainer = document.querySelector('.lines-container');
        if (!linesContainer) {
            return null;
        }
        
        const lineId = this.nextLineId++;
        
        // Create line wrapper
        const lineWrapper = document.createElement('div');
        lineWrapper.className = 'line-wrapper';
        lineWrapper.dataset.lineId = lineId;
        lineWrapper.dataset.inputType = 'text'; // Start as text
        
        // Create content area
        const contentArea = document.createElement('div');
        contentArea.className = 'line-content-area';
        
        // Create cursor indicator
        const cursorIndicator = document.createElement('div');
        cursorIndicator.className = 'cursor-indicator';
        
        // Create text input (default)
        const textInput = document.createElement('textarea');
        textInput.className = 'line-text-input';
        textInput.placeholder = 'Type or Double tap for checkbox or list';
        textInput.style.resize = 'none';
        textInput.style.overflow = 'hidden';
        textInput.style.minHeight = '24px';
        textInput.setAttribute('readonly', 'readonly');
        textInput.setAttribute('onfocus', 'this.removeAttribute("readonly");');
        
        // Create drag indicator (will be positioned at end)
        const dragIndicator = document.createElement('div');
        dragIndicator.className = 'drag-indicator';
        dragIndicator.innerHTML = '<span class="material-icons">drag_indicator</span>';
        
        // Assemble the structure
        contentArea.appendChild(cursorIndicator);
        contentArea.appendChild(textInput);
        contentArea.appendChild(dragIndicator);
        lineWrapper.appendChild(contentArea);
        
        // Insert line at appropriate position
        if (afterElement) {
            afterElement.parentNode.insertBefore(lineWrapper, afterElement.nextSibling);
        } else {
            linesContainer.appendChild(lineWrapper);
        }
        
        // Setup events for this line
        this.setupLineEvents(lineWrapper, textInput);
        
        // Initialize drag handle visibility and position
        this.updateDragHandlePosition(lineWrapper, textInput);
        this.updateDragHandleVisibility(lineWrapper, textInput);
        
        // Focus the new line
        textInput.focus();
        
        this.lineItems.push({
            id: lineId,
            element: lineWrapper,
            inputType: 'text'
        });
        
        return lineWrapper;
    }

    updateDragHandleVisibility(lineWrapper, textInput) {
        // Show drag handle for checkbox and bullet inputs (even when empty)
        const inputType = lineWrapper.dataset.inputType;
        if (inputType === 'checkbox' || inputType === 'bullet') {
            lineWrapper.classList.add('has-content');
        } else {
            lineWrapper.classList.remove('has-content');
        }
    }

    updateDragHandlePosition(lineWrapper, textInput) {
        if (!textInput) return;
        
        const dragIndicator = lineWrapper.querySelector('.drag-indicator');
        if (!dragIndicator) return;
        
        // Check if textarea is multiline (scrollHeight > minHeight + some buffer)
        const isMultiline = textInput.scrollHeight > 40; // 24px min height + padding
        
        if (isMultiline) {
            // Position at the end of first line for multiline
            dragIndicator.classList.add('multiline-position');
        } else {
            // Normal position at the end
            dragIndicator.classList.remove('multiline-position');
        }
    }

    setupLineEvents(lineWrapper, textInput) {
        const lineId = lineWrapper.dataset.lineId;
        
        // Auto-resize and handle visibility
        textInput.addEventListener('input', () => {
            textInput.style.height = 'auto';
            textInput.style.height = textInput.scrollHeight + 'px';
            
            // Check if multiline and update drag handle position
            this.updateDragHandlePosition(lineWrapper, textInput);
            
            // Show/hide drag handle based on content
            this.updateDragHandleVisibility(lineWrapper, textInput);
            
            this.saveCurrentNote();
        });
        
        // Double-tap for type switching (mobile)
        textInput.addEventListener('touchstart', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - this.lastTap;
            
            if (tapLength < 500 && tapLength > 0) {
                // Double tap detected - check if in placeholder state
                if (textInput.value.trim() === '') {
                    e.preventDefault();
                    this.switchLineInputType(lineWrapper);
                    return;
                }
            }
            this.lastTap = currentTime;
        });
        
        // Double-tap for type switching (desktop)
        textInput.addEventListener('click', (e) => {
            if (!('ontouchstart' in window)) {
                const currentTime = new Date().getTime();
                const tapLength = currentTime - this.lastTap;
                
                if (tapLength < 500 && tapLength > 0) {
                    if (textInput.value.trim() === '') {
                        this.switchLineInputType(lineWrapper);
                    }
                }
                this.lastTap = currentTime;
            }
        });
        
        // Enter key to create new line
        textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                
                const currentInputType = lineWrapper.dataset.inputType;
                const hasContent = textInput.value.trim() !== '';
                
                if (hasContent) {
                    // Content exists - create new line with same type
                    const newLineWrapper = this.createNewLine(lineWrapper);
                    newLineWrapper.dataset.inputType = currentInputType;
                    this.updateLineDisplay(newLineWrapper, currentInputType);
                } else {
                    // Empty line - check if previous line was also empty
                    const prevSibling = lineWrapper.previousElementSibling;
                    const isPrevEmpty = prevSibling && 
                        prevSibling.querySelector('.line-text-input, .checkbox-item-text, .bullet-item-text')?.value.trim() === '';
                    
                    if (isPrevEmpty) {
                        // Double enter - create normal text input
                        const newLineWrapper = this.createNewLine(lineWrapper);
                        newLineWrapper.dataset.inputType = 'text';
                        this.updateLineDisplay(newLineWrapper, 'text');
                    } else {
                        // Single enter on empty line - continue with same type
                        const newLineWrapper = this.createNewLine(lineWrapper);
                        newLineWrapper.dataset.inputType = currentInputType;
                        this.updateLineDisplay(newLineWrapper, currentInputType);
                    }
                }
            } else if (e.key === 'Backspace') {
                if (textInput.value === '') {
                    // Check if current line is checkbox or bullet
                    const currentType = lineWrapper.dataset.inputType;
                    if (currentType === 'checkbox' || currentType === 'bullet') {
                        e.preventDefault();
                        // Switch to normal text input
                        lineWrapper.dataset.inputType = 'text';
                        this.updateLineDisplay(lineWrapper, 'text');
                        return;
                    }
                    
                    // If already normal text, delete the line and jump to previous
                    const lines = document.querySelectorAll('.line-wrapper');
                    const currentIndex = Array.from(lines).indexOf(lineWrapper);
                    
                    if (lines.length > 1) {
                        e.preventDefault();
                        // Delete current line
                        this.deleteLine(lineWrapper);
                        
                        // Focus the previous line
                        if (currentIndex > 0) {
                            const prevLine = lines[currentIndex - 1];
                            const prevInput = prevLine.querySelector('textarea');
                            if (prevInput) {
                                prevInput.focus();
                                prevInput.setSelectionRange(prevInput.value.length, prevInput.value.length);
                            }
                        }
                    }
                }
            }
        });
        
        // Focus handling
        textInput.addEventListener('focus', () => {
            textInput.removeAttribute('readonly');
        });
    }

    switchLineInputType(lineWrapper) {
        const currentType = lineWrapper.dataset.inputType || 'text';
        const types = ['text', 'checkbox', 'bullet'];
        const currentIndex = types.indexOf(currentType);
        const nextIndex = (currentIndex + 1) % types.length;
        const newType = types[nextIndex];
        
        lineWrapper.dataset.inputType = newType;
        
        // Update the line item tracking
        const lineItem = this.lineItems.find(item => item.element === lineWrapper);
        if (lineItem) {
            lineItem.inputType = newType;
        }
        
        this.updateLineDisplay(lineWrapper, newType);
    }

    updateLineDisplay(lineWrapper, inputType, setFocus = true) {
        // Don't recreate content area, just update its contents
        let contentArea = lineWrapper.querySelector('.line-content-area');
        
        // If structure doesn't exist, create it
        if (!contentArea) {
            lineWrapper.innerHTML = '';
            
            // Create content area
            contentArea = document.createElement('div');
            contentArea.className = 'line-content-area';
            
            lineWrapper.appendChild(contentArea);
        }
        
        // Clear content area
        contentArea.innerHTML = '';
        
        // Create cursor indicator
        const cursorIndicator = document.createElement('div');
        cursorIndicator.className = 'cursor-indicator';
        
        // Create drag indicator (will be positioned at end)
        const dragIndicator = document.createElement('div');
        dragIndicator.className = 'drag-indicator';
        dragIndicator.innerHTML = '<span class="material-icons">drag_indicator</span>';
        
        if (inputType === 'checkbox') {
            const checkboxItem = document.createElement('div');
            checkboxItem.className = 'checkbox-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            
            const textInput = document.createElement('textarea');
            textInput.className = 'checkbox-item-text';
            textInput.placeholder = 'Type or Double tap for pointer';
            textInput.rows = 1;
            textInput.style.resize = 'none';
            textInput.style.overflow = 'hidden';
            textInput.style.minHeight = '24px';
            textInput.setAttribute('readonly', 'readonly');
            textInput.setAttribute('onfocus', 'this.removeAttribute("readonly");');
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'item-delete';
            deleteBtn.innerHTML = '<span class="material-icons">close</span>';
            
            deleteBtn.type = 'button';
            checkboxItem.appendChild(checkbox);
            checkboxItem.appendChild(textInput);
            checkboxItem.appendChild(deleteBtn);
            
            contentArea.appendChild(checkboxItem);
            contentArea.appendChild(cursorIndicator);
            contentArea.appendChild(dragIndicator);
            
            // Setup checkbox toggle
            checkbox.addEventListener('change', () => {
                checkboxItem.classList.toggle('completed', checkbox.checked);
                this.saveCurrentNote();
            });
            
            // Setup delete button
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('Delete button clicked for line:', lineWrapper.dataset.lineId);
                this.deleteLine(lineWrapper);
            });
            
            // Update checkbox content visibility
            textInput.addEventListener('input', () => {
                if (textInput.value.trim() !== '') {
                    checkboxItem.classList.add('has-content');
                } else {
                    checkboxItem.classList.remove('has-content');
                }
                console.log('Checkbox content updated:', textInput.value.trim() !== '' ? 'has content' : 'empty');
            });
            
            // Initialize checkbox content state
            if (textInput.value.trim() !== '') {
                checkboxItem.classList.add('has-content');
                console.log('Initial checkbox state: has content');
            } else {
                console.log('Initial checkbox state: empty');
            }
            
            this.setupLineEvents(lineWrapper, textInput);
            
            // Update drag handle position and visibility based on existing content
            this.updateDragHandlePosition(lineWrapper, textInput);
            this.updateDragHandleVisibility(lineWrapper, textInput);
            
            textInput.focus();
            
        } else if (inputType === 'bullet') {
            const bulletItem = document.createElement('div');
            bulletItem.className = 'bullet-item';
            
            // Create bullet point
            const bulletPoint = document.createElement('div');
            bulletPoint.className = 'bullet-point';
            bulletPoint.innerHTML = '•';
            
            const textInput = document.createElement('textarea');
            textInput.className = 'bullet-item-text';
            textInput.placeholder = 'Type or Double tap for paragraph';
            textInput.rows = 1;
            textInput.style.resize = 'none';
            textInput.style.overflow = 'hidden';
            textInput.style.minHeight = '24px';
            textInput.setAttribute('readonly', 'readonly');
            textInput.setAttribute('onfocus', 'this.removeAttribute("readonly");');
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'item-delete';
            deleteBtn.innerHTML = '<span class="material-icons">close</span>';
            
            deleteBtn.type = 'button';
            bulletItem.appendChild(bulletPoint);
            bulletItem.appendChild(textInput);
            bulletItem.appendChild(deleteBtn);
            
            contentArea.appendChild(bulletItem);
            contentArea.appendChild(cursorIndicator);
            contentArea.appendChild(dragIndicator);
            
            // Setup delete button
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('Delete button clicked for line:', lineWrapper.dataset.lineId);
                this.deleteLine(lineWrapper);
            });
            
            this.setupLineEvents(lineWrapper, textInput);
            
            // Update drag handle position and visibility based on existing content
            this.updateDragHandlePosition(lineWrapper, textInput);
            this.updateDragHandleVisibility(lineWrapper, textInput);
            
            textInput.focus();
            
        } else {
            // Default text input
            const textInput = document.createElement('textarea');
            textInput.className = 'line-text-input';
            textInput.placeholder = 'Type or Double tap for checkbox or list';
            textInput.style.resize = 'none';
            textInput.style.overflow = 'hidden';
            textInput.style.minHeight = '24px';
            textInput.setAttribute('readonly', 'readonly');
            textInput.setAttribute('onfocus', 'this.removeAttribute("readonly");');
            
            contentArea.appendChild(cursorIndicator);
            contentArea.appendChild(textInput);
            contentArea.appendChild(dragIndicator);
            
            this.setupLineEvents(lineWrapper, textInput);
            
            // Update drag handle position and visibility based on existing content
            this.updateDragHandlePosition(lineWrapper, textInput);
            this.updateDragHandleVisibility(lineWrapper, textInput);
            
            textInput.focus();
        }
    }

    deleteLine(lineWrapper) {
        try {
            const lineId = parseInt(lineWrapper.dataset.lineId);
            console.log('deleteLine called for:', lineId);
            
            // Find line by ID instead of element reference
            const lineIndex = this.lineItems.findIndex(item => item.id === lineId);
            console.log('Found line at index:', lineIndex, 'Total lines:', this.lineItems.length);
            
            if (lineIndex > -1) {
                // Check if this is the first line and it's a checkbox or bullet
                const isFirstLine = lineIndex === 0;
                const currentType = lineWrapper.dataset.inputType;
                const isSpecialType = currentType === 'checkbox' || currentType === 'bullet';
                
                if (isFirstLine && isSpecialType) {
                    // Convert to normal text input instead of deleting
                    console.log('Converting first special type to normal text input');
                    lineWrapper.dataset.inputType = 'text';
                    this.updateLineDisplay(lineWrapper, 'text');
                    return;
                }
                
                // Focus previous or next line
                let focusTarget = null;
                if (lineIndex > 0) {
                    // Find previous line in DOM
                    const prevLine = lineWrapper.previousElementSibling;
                    if (prevLine) {
                        focusTarget = prevLine.querySelector('textarea');
                    }
                } else if (this.lineItems.length > 1) {
                    // Find next line in DOM
                    const nextLine = lineWrapper.nextElementSibling;
                    if (nextLine) {
                        focusTarget = nextLine.querySelector('textarea');
                    }
                }
                
                // Remove from tracking
                this.lineItems.splice(lineIndex, 1);
                console.log('Removed line from tracking. Remaining lines:', this.lineItems.length);
                
                // Remove element
                lineWrapper.remove();
                console.log('Removed element from DOM');
                
                // Focus target
                if (focusTarget) {
                    focusTarget.focus();
                    focusTarget.setSelectionRange(focusTarget.value.length, focusTarget.value.length);
                }
                
                this.saveCurrentNote();
            } else {
                console.log('Line not found in tracking array');
            }
        } catch (error) {
            console.error('Error in deleteLine:', error);
        }
    }

    syncLineItemsWithDOM() {
        // Update lineItems array with current DOM state
        const linesContainer = document.querySelector('.lines-container');
        if (!linesContainer) return;
        
        this.lineItems = [];
        const lineWrappers = linesContainer.querySelectorAll('.line-wrapper');
        
        lineWrappers.forEach(lineWrapper => {
            const lineId = parseInt(lineWrapper.dataset.lineId);
            const inputType = lineWrapper.dataset.inputType || 'text';
            
            let content = '';
            let checked = false;
            
            // Get content based on input type
            const textInput = lineWrapper.querySelector('.line-text-input, .checkbox-item-text, .bullet-item-text');
            if (textInput) {
                content = textInput.value;
            }
            
            // Get checkbox state
            if (inputType === 'checkbox') {
                const checkbox = lineWrapper.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checked = checkbox.checked;
                }
            }
            
            this.lineItems.push({
                id: lineId,
                inputType: inputType,
                content: content,
                checked: checked
            });
        });
    }

    // isInPlaceholderState function removed - now handled per-line in the new system

    // switchInputType function removed - now handled by switchLineInputType in per-line system

    // updateInputTypeDisplay function removed - now handled by updateLineDisplay in per-line system

    // createNewItem function removed - now handled by createNewLine in per-line system

    // createCheckboxItem and createBulletItem functions removed - now handled by updateLineDisplay in per-line system

    // bindItemEvents function removed - now handled by setupLineEvents in per-line system

    // handleItemDelete function removed - now handled by deleteLine in per-line system
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GoogleKeepApp();
});

// Auto-resize functionality now handled per-line in setupLineEvents

// Enhanced mobile input handling with stable positioning
document.addEventListener('DOMContentLoaded', () => {
    const titleInput = document.querySelector('.title-input');
    const mainContent = document.querySelector('.main-content');
    const bottomToolbar = document.querySelector('.bottom-toolbar');
    
    let isKeyboardOpen = false;
    let keyboardHeight = 0;
    let initialScrollY = 0;
    
    // Prevent document scroll when keyboard appears
    function preventDocumentScroll() {
        initialScrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${initialScrollY}px`;
        document.body.style.width = '100%';
    }
    
    // Restore document scroll when keyboard disappears
    function restoreDocumentScroll() {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, initialScrollY);
    }
    
    // Function to update toolbar position
    function updateToolbarPosition() {
        if (isKeyboardOpen && keyboardHeight > 150) {
            // Position toolbar above keyboard
            document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
            document.body.classList.add('keyboard-open', 'keyboard-detected');
            mainContent.classList.add('keyboard-active');
            preventDocumentScroll();
        } else {
            // Reset toolbar to normal position
            document.documentElement.style.removeProperty('--keyboard-height');
            document.body.classList.remove('keyboard-open', 'keyboard-detected');
            mainContent.classList.remove('keyboard-active');
            restoreDocumentScroll();
        }
    }
    
    // Handle bottom toolbar clicks - prevent focus loss
    bottomToolbar.addEventListener('touchstart', (e) => {
        e.stopPropagation();
    });
    
    bottomToolbar.addEventListener('click', (e) => {
        e.stopPropagation();
        // Don't blur inputs when clicking toolbar
        e.preventDefault();
    });
    
    // Mobile keyboard handling for title input
    titleInput.addEventListener('focus', (e) => {
        // Remove readonly immediately on focus
        titleInput.removeAttribute('readonly');
        
        isKeyboardOpen = true;
        
        // Small delay to detect keyboard
        setTimeout(() => {
            updateToolbarPosition();
        }, 100);
    });
    
    titleInput.addEventListener('blur', () => {
        // Small delay to check if another input is being focused
        setTimeout(() => {
            const activeElement = document.activeElement;
            // Check if focus moved to a line input
            const isLineInput = activeElement && (
                activeElement.classList.contains('line-text-input') ||
                activeElement.classList.contains('checkbox-item-text') ||
                activeElement.classList.contains('bullet-item-text')
            );
            
            if (activeElement !== titleInput && !isLineInput) {
                isKeyboardOpen = false;
                updateToolbarPosition();
            }
        }, 150);
    });
    
    // Handle dynamic line inputs (delegated event handling)
    document.addEventListener('focus', (e) => {
        const target = e.target;
        if (target && (
            target.classList.contains('line-text-input') ||
            target.classList.contains('checkbox-item-text') ||
            target.classList.contains('bullet-item-text')
        )) {
            // Remove readonly immediately on focus
            target.removeAttribute('readonly');
            
            isKeyboardOpen = true;
            
            // Small delay to detect keyboard
            setTimeout(() => {
                updateToolbarPosition();
            }, 100);
        }
    }, true);
    
    document.addEventListener('blur', (e) => {
        const target = e.target;
        if (target && (
            target.classList.contains('line-text-input') ||
            target.classList.contains('checkbox-item-text') ||
            target.classList.contains('bullet-item-text')
        )) {
            // Small delay to check if another input is being focused
            setTimeout(() => {
                const activeElement = document.activeElement;
                // Check if focus moved to title or another line input
                const isAnyInput = activeElement && (
                    activeElement === titleInput ||
                    activeElement.classList.contains('line-text-input') ||
                    activeElement.classList.contains('checkbox-item-text') ||
                    activeElement.classList.contains('bullet-item-text')
                );
                
                if (!isAnyInput) {
                    isKeyboardOpen = false;
                    updateToolbarPosition();
                }
            }, 150);
        }
    }, true);
    
    // Handle visual viewport changes (mobile keyboard detection)
    if (window.visualViewport) {
        let resizeTimeout;
        
        window.visualViewport.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newKeyboardHeight = window.innerHeight - window.visualViewport.height;
                keyboardHeight = newKeyboardHeight;
                updateToolbarPosition();
            }, 50);
        });
    }
    
    // Fallback for browsers without Visual Viewport API
    let initialViewportHeight = window.innerHeight;
    let resizeTimeout;
    
    window.addEventListener('resize', () => {
        if (!window.visualViewport) {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const currentHeight = window.innerHeight;
                const heightDifference = initialViewportHeight - currentHeight;
                
                if (heightDifference > 150) {
                    keyboardHeight = heightDifference;
                    if (isKeyboardOpen) {
                        updateToolbarPosition();
                    }
                } else if (heightDifference < 50) {
                    keyboardHeight = 0;
                    updateToolbarPosition();
                }
            }, 100);
        }
    });
    
    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            initialViewportHeight = window.innerHeight;
            keyboardHeight = 0;
            updateToolbarPosition();
        }, 500);
    });
    
    // Prevent page bouncing on iOS
    document.addEventListener('touchmove', (e) => {
        if (isKeyboardOpen) {
            const target = e.target;
            if (target !== titleInput && target !== contentTextarea && !mainContent.contains(target)) {
                e.preventDefault();
            }
        }
    }, { passive: false });
});

// Auto-resize now handled per-line in GoogleKeepApp