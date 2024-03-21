document.addEventListener('DOMContentLoaded', function() {
    const wordDisplay = document.getElementById('wordDisplay');
    const nextWordBtn = document.getElementById('nextWordBtn');
    const startQuizBtn = document.getElementById('startQuizBtn');
    const progressPercentage = document.getElementById('progressPercentage')
    // Original data for demonstration
    const vocabulary = [
        { word: 'Hello', translation: 'Bonjour', language: 'English-French' },
        { word: 'Goodbye', translation: 'Au revoir', language: 'English-French' },
        { word: 'Thank you', translation: 'Merci', language: 'English-French' },
        { word: 'Welcome', translation: 'Swagatam', language: 'English-Sanskrit' },
        // Add more vocabulary words as needed
    ];


    
    let currentIndex = 0;

    // Display initial word
    displayWord(currentIndex);

    // Event listener for 'Next Word' button
    nextWordBtn.addEventListener('click', function() {
        currentIndex = (currentIndex + 1) % vocabulary.length;
        displayWord(currentIndex);
    });

    // Display word and translation
    function displayWord(index) {
        wordDisplay.textContent = `${vocabulary[index].word} - ${vocabulary[index].translation}`;
    }

    // Quiz logic
    startQuizBtn.addEventListener('click', function() {
        const score = prompt('Enter your score:');
        if (score !== null && !isNaN(score) && score !== '') {
            const percentage = (score / vocabulary.length) * 100;
            alert(`Your score: ${percentage.toFixed(2)}%`);
            updateProgress(percentage);
        } else {
            alert('Invalid input. Please enter a valid score.');
        }
    });

    // Update progress
    function updateProgress(percentage) {
        // Implement real progress tracking here, e.g., send to server or store locally
        progressPercentage.textContent = percentage.toFixed(2) + '%';
    }

    // Initial progress tracking (for demonstration)
    let initialProgress = 0;
    updateProgress(initialProgress);
});
