const API_URL = "https://www.googleapis.com/books/v1/volumes";
const API_KEY = "AIzaSyBjXjxu_wP8PTA60zyhVqjyGJAUIUl0rb4";

// Fetch books from the Google Books API
const fetchBooks = (query) => {
    console.log("Fetching books with query:", query);
    $.ajax({
        url: API_URL,
        method: "GET",
        data: {
            q: query,
            maxResults: 10,
            key: API_KEY,
        },
        success: (data) => {
            console.log("API Response:", data);
            if (data.items && data.items.length > 0) {
                renderSearchResults(data.items);
            } else {
                $("#results").html("<p>No books found.</p>");
            }
        },
        error: (error) => {
            console.error("Error fetching data:", error);
            $("#results").html("<p>Failed to fetch books. Please try again later.</p>");
        },
    });
};

// Render search results based on the selected view
const renderSearchResults = (books) => {
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = '';  // Clear previous results

    const viewMode = localStorage.getItem('viewMode') || 'grid';  // Default to grid view
    const bookContainer = document.createElement('div');
    bookContainer.classList.add(viewMode);  // Use the active view mode class

    books.forEach(book => {
        const bookDiv = document.createElement("div");
        bookDiv.classList.add("book");

        const bookImage = document.createElement("img");
        // Use a placeholder image if no image is available
        bookImage.src = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : "https://via.placeholder.com/150";
        bookImage.alt = book.volumeInfo.title || "No Title";

        const bookTitle = document.createElement("h3");
        bookTitle.textContent = book.volumeInfo.title || "No Title";

        const bookAuthors = document.createElement("p");
        bookAuthors.textContent = (book.volumeInfo.authors || ["Unknown Author"]).join(", ");

        const detailsButton = document.createElement("button");
        detailsButton.classList.add("details-btn");
        detailsButton.dataset.id = book.id;
        detailsButton.textContent = "View Details";

        bookDiv.appendChild(bookImage);
        bookDiv.appendChild(bookTitle);
        bookDiv.appendChild(bookAuthors);
        bookDiv.appendChild(detailsButton);

        bookContainer.appendChild(bookDiv);
    });

    resultsContainer.appendChild(bookContainer);

    // Ensure that the search bar and view buttons remain accessible
    document.getElementById("search-input").disabled = false;
    document.getElementById("search-button").disabled = false;
    document.getElementById("grid-view").disabled = false;
    document.getElementById("list-view").disabled = false;
};

// Toggle between grid and list views
const toggleView = (view) => {
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = '';  // Clear existing results
    localStorage.setItem('viewMode', view);  // Save the view mode to localStorage
    fetchBooks(document.getElementById("search-input").value.trim());
};

// Search button click event
document.getElementById("search-button").addEventListener("click", () => {
    const query = document.getElementById("search-input").value.trim();
    if (query) {
        fetchBooks(query);
        addSearchToHistory(query);
    } else {
        alert("Please enter a search term.");
    }
});

// View toggle button events
document.getElementById("grid-view").addEventListener("click", () => toggleView('grid'));
document.getElementById("list-view").addEventListener("click", () => toggleView('list'));

// Add search term to history
const addSearchToHistory = (query) => {
    const recentSearchesList = document.getElementById("recent-searches-list");
    let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];

    // Add new search to recent searches array
    if (!recentSearches.includes(query)) {
        recentSearches.unshift(query);
        if (recentSearches.length > 5) {
            recentSearches.pop();  // Keep the list limited to the last 5 searches
        }
        localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
    }

    // Update the recent searches UI
    renderRecentSearches();
};

// Render recent searches in the UI
const renderRecentSearches = () => {
    const recentSearchesList = document.getElementById("recent-searches-list");
    let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];

    recentSearchesList.innerHTML = '';  // Clear existing recent searches

    recentSearches.forEach(query => {
        const listItem = document.createElement("li");
        listItem.textContent = query;
        recentSearchesList.appendChild(listItem);
    });
};

// Fetch and display book details
const fetchBookDetails = (bookId) => {
    $.ajax({
        url: `${API_URL}/${bookId}`,
        method: "GET",
        success: (book) => {
            renderBookDetails(book);
        },
        error: (error) => {
            console.error("Error fetching book details:", error);
            document.getElementById("book-details").innerHTML = "<p>Failed to fetch book details.</p>";
        },
    });
};

// Render book details
const renderBookDetails = (book) => {
    const bookDetailsContainer = document.getElementById("book-details");
    const detailsHtml = `
        <h2>${book.volumeInfo.title || "No Title"}</h2>
        <img src="${book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : "https://via.placeholder.com/150"}" alt="${book.volumeInfo.title}" />
        <p><strong>Authors:</strong> ${book.volumeInfo.authors ? book.volumeInfo.authors.join(", ") : "Unknown Author"}</p>
        <p><strong>Publisher:</strong> ${book.volumeInfo.publisher || "Unknown Publisher"}</p>
        <p><strong>Published Date:</strong> ${book.volumeInfo.publishedDate || "Unknown Date"}</p>
        <p><strong>Description:</strong> ${book.volumeInfo.description || "No Description Available"}</p>
        <button id="back-to-results">Back to Results</button>
    `;
    bookDetailsContainer.innerHTML = detailsHtml;
    bookDetailsContainer.classList.remove('hidden');
    document.getElementById("results").classList.add('hidden');
};

// Back to results button
document.addEventListener("click", function(event) {
    if (event.target && event.target.id === "back-to-results") {
        document.getElementById("book-details").classList.add('hidden');
        document.getElementById("results").classList.remove('hidden');
    }
});

// Search history click event
document.addEventListener("click", function(event) {
    if (event.target && event.target.classList.contains("history-item")) {
        const query = event.target.textContent;
        fetchBooks(query);
    }
});

// Initialize view based on stored preference
if (localStorage.getItem('viewMode')) {
    fetchBooks(document.getElementById("search-input").value.trim());
} else {
    localStorage.setItem('viewMode', 'grid');  // Default to grid view
}

// Open and close bookshelf overlay
document.getElementById("close-bookshelf").addEventListener("click", () => {
    document.getElementById("bookshelf").classList.add('hidden');
});

// Initialize recent searches list on page load
window.addEventListener("load", () => {
    renderRecentSearches();
});
