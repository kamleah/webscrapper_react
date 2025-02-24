import axios from 'axios';
import React, { useState } from 'react';
import Markdown from 'react-markdown'

const ScrapperV3 = () => {
    // State for input text
    const [inputText, setInputText] = useState('');

    // State for selected languages
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [scrapperOutput, setScrapperOutput] = useState();
    const [productArray, setProductArray] = useState([]);
    const [selectedTags, setSelectedTags] = useState(['name']);

    // State for submission result
    const [result, setResult] = useState(false);
    const [translating, setTranslating] = useState(false);

    // Handle input text change
    const handleInputChange = (e) => {
        setInputText(e.target.value);
        setTranslating(false);
    };

    // Handle checkbox change
    const handleCheckboxChange = (language) => {
        if (selectedLanguages.includes(language)) {
            // If the language is already selected, remove it
            setSelectedLanguages(selectedLanguages.filter((lang) => lang !== language));
        } else {
            // If the language is not selected, add it
            setSelectedLanguages([...selectedLanguages, language]);
        }
    };

    // Handle tags checkbox change
    const handleTagsCheckboxChange = (tag) => {
        if (selectedTags.includes(tag)) {
            if (tag == "name") return;
            // If the language is already selected, remove it
            setSelectedTags(selectedTags.filter((lang) => lang !== tag));
        } else {
            // If the language is not selected, add it
            setSelectedTags([...selectedTags, tag]);
        }
    };

    function findMatchingWords(array, spanishDescription) {
        // Convert the description to lowercase for case-insensitive comparison
        const descriptionWords = spanishDescription.toLowerCase().split(/[\s,]+/); // Split by space and comma

        // Filter the array to find words present in the description
        const matchingWords = array.filter(word =>
            descriptionWords.some(descWord => word.toLowerCase().includes(descWord))
        );

        return matchingWords;
    }

    const convertToCSV = (productArray) => {
        let headers = new Set();
        let rows = [];
        productArray.forEach(product => {
            const productName = Object.keys(product)[0];
            const productDetails = product[productName];
            let row = { Name: productName, ...productDetails };
            Object.keys(row).forEach(key => headers.add(key));
            rows.push(row);
        });

        headers = Array.from(headers);

        const newTags = selectedTags.join(', ');
        const newHEaders = findMatchingWords(headers, newTags);
        
        let csvContent = newHEaders.join(",") + "\n";
        rows.forEach(row => {
            console.log("row", row);
            let rowData = newHEaders.map(header => `"${row[header] || ''}"`).join(",");
            csvContent += rowData + "\n";
        });

        return csvContent;
    };

   

    const downloadCSV = () => {
        const csvContent = convertToCSV(productArray);
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "products.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const translateAPI = async (payload) => {
        try {
            console.log(payload);
            axios.post("https://scrapper-api.techiebears.com/scrap/web-scrapping-v3/", payload).then((response) => {
                setProductArray(response.data.json);
                setScrapperOutput(response.data.data);
            }).catch((error) => {
                console.log(error);
            });
        } catch (error) {
            console.log(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setScrapperOutput();
        setTranslating(true);
        const payload = {
            url: inputText.split(','),
            languages: [selectedLanguages.join(', ')]
        };
        await translateAPI(payload)
    };

    const languages = [
        { id: 'spanish', label: 'Spanish' },
        { id: 'japanese', label: 'Japanese' },
        { id: 'french', label: 'French' },
        { id: 'german', label: 'German' }
    ];

    const tagsToTranslate = [
        { id: 'name', label: 'Name' },
        { id: 'link', label: 'Link' },
        { id: 'description', label: 'Description' },
        { id: 'price', label: 'Price' },
    ];

    return (
        <>
            <div className="max-w-6xl mx-auto p-8 bg-white rounded-xl my-4 shadow-lg w-full">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Text Area */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Enter Link
                        </label>
                        <textarea
                            value={inputText}
                            onChange={handleInputChange}
                            placeholder="Enter text for translation..."
                            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Language Selection */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Select Languages</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {languages.map((language) => (
                                <div key={language.id} className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        id={language.id}
                                        checked={selectedLanguages.includes(language.id)}
                                        onChange={() => handleCheckboxChange(language.id)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label
                                        htmlFor={language.id}
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        {language.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* tagsToTranslate */}

                    {/* Translate Selection */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Select Tags to Translate</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {tagsToTranslate.map((tag) => (
                                <div key={tag.id} className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        id={tag.id}
                                        checked={selectedTags.includes(tag.id)}
                                        onChange={() => handleTagsCheckboxChange(tag.id)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label
                                        htmlFor={tag.id}
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        {tag.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Translate
                        </button>
                        {productArray.length > 0 && <button
                            type="button"
                            onClick={downloadCSV}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                            Download Excel
                        </button>}
                    </div>
                </form>
            </div>

            {/* Results Section */}
            {
                translating && (
                    <div className="max-w-6xl mx-auto p-8 bg-white rounded-xl my-4 shadow-lg w-full">
                        <div className="bg-white rounded-xl">
                            <h2 className="text-xl font-semibold text-gray-800">Search Results</h2>
                            <div className="mt-2">
                                <p className="text-gray-600 font-medium">You searched for:</p>
                                <ul className="list-disc list-inside text-gray-700">
                                    {inputText?.split(',').map((link, index) => (
                                        <li key={index}>
                                            <a
                                                href={link.trim()}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                {link.trim()}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-4">
                                <p className="text-gray-600 font-medium">Selected Languages:</p>
                                <p className="text-gray-800 font-semibold capitalize">
                                    {selectedLanguages.length > 0 ? selectedLanguages.join(', ') : 'None'}
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Scrapper Output */}
            {
                scrapperOutput && (
                    <div className="max-w-6xl mx-auto p-8 bg-white rounded-xl my-4 shadow-lg w-full">
                        <div className="mt-2 bg-gray-50 rounded-md">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Scrapper Output
                            </h3>
                            <div className="prose max-w-none">
                                <Markdown>{scrapperOutput}</Markdown>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default ScrapperV3;