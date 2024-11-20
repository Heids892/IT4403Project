const API_URL = "https://www.googleapis.com/books/v1/volumes";
const API_KEY = "AIzaSyBjXjxu_wP8PTA60zyhVqjyGJAUIUl0rb4";  // Replace with your new API key


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
                addSearchToHistory(query);
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

// Render search results using Mustache.js
const renderSearchResults = (books) => {
    const template = `
        {{#books}}
        <div class="book">
            <img src="{{thumbnail}}" alt="{{title}}" />
            <h3>{{title}}</h3>
            <p>{{authors}}</p>
            <button class="details-btn" data-id="{{id}}">View Details</button>
        </div>
        {{/books}}
    `;
    const processedBooks = books.map((book) => ({
        id: book.id,
        title: book.volumeInfo.title || "No Title",
        authors: (book.volumeInfo.authors || ["Unknown Author"]).join(", "),
        thumbnail:
            (book.volumeInfo.imageLinks && book.volumeInfo.imageLinks.thumbnail) ||
            "https://via.placeholder.com/150",
    }));
    $("#results").html(Mustache.render(template, { books: processedBooks }));
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
            $("#book-details").html("<p>Failed to fetch book details.</p>");
        },
    });
};

// Render book details using Mustache.js
const renderBookDetails = (book) => {
    const template = `
        <h2>{{title}}</h2>
        <img src="{{thumbnail}}" alt="{{title}}" />
        <p><strong>Authors:</strong> {{authors}}</p>
        <p><strong>Publisher:</strong> {{publisher}}</p>
        <p><strong>Published Date:</strong> {{publishedDate}}</p>
        <p><strong>Description:</strong> {{description}}</p>
        <button id="back-to-results">Back to Results</button>
    `;
    const bookDetails = {
        title: book.volumeInfo.title || "No Title",
        authors: (book.volumeInfo.authors || ["Unknown Author"]).join(", "),
        publisher: book.volumeInfo.publisher || "Unknown Publisher",
        publishedDate: book.volumeInfo.publishedDate || "Unknown Date",
        description: book.volumeInfo.description || "No Description Available",
        thumbnail:
            (book.volumeInfo.imageLinks && book.volumeInfo.imageLinks.thumbnail) ||
            "https://via.placeholder.com/150",
    };
    $("#book-details").html(Mustache.render(template, bookDetails)).show();
    $("#results").hide();
};

// Add search term to history
const addSearchToHistory = (query) => {
    const historyList = $("#history-list");
    const existingItem = historyList.find(`li:contains(${query})`);
    if (existingItem.length === 0) {
        historyList.append(`<li class="history-item">${query}</li>`);
    }
};

// Search button click event
$("#search-button").click(() => {
    const query = $("#search-input").val().trim();
    if (query) {
        fetchBooks(query);
    } else {
        alert("Please enter a search term.");
    }
});

// Delegate event to dynamically created "View Details" buttons
$(document).on("click", ".details-btn", function () {
    const bookId = $(this).data("id");
    fetchBookDetails(bookId);
});

// Back to results button
$(document).on("click", "#back-to-results", () => {
    $("#book-details").hide();
    $("#results").show();
});

// Search history click event
$(document).on("click", ".history-item", function () {
    const query = $(this).text();
    fetchBooks(query);
});
