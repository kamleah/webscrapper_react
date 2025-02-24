import axios from 'axios';
import React, { useState } from 'react';
import Markdown from 'react-markdown'

const ScrapperV2 = () => {
    // State for input text
    const [inputText, setInputText] = useState('');

    // State for selected languages
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [scrapperOutput, setScrapperOutput] = useState();
    const [productArray, setProductArray] = useState([]);

    // State for submission result
    const [result, setResult] = useState('');

    // Handle input text change
    const handleInputChange = (e) => {
        setInputText(e.target.value);
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
        let csvContent = headers.join(",") + "\n";
    
        rows.forEach(row => {
            let rowData = headers.map(header => `"${row[header] || ''}"`).join(",");
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
            axios.post("http://127.0.0.1:8000/webscrapper/web-scrapping-v3/", payload).then((response) => {
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
        // Prepare the result message
        const resultMessage = `You entered: "${inputText}" and selected: ${selectedLanguages.join(', ') || 'None'}`;
        setResult(resultMessage);
        const payload = {
            url: inputText.split(','),
            languages: [selectedLanguages.join(', ')]
        };
        await translateAPI(payload)
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                {/* Input field */}

                <textarea
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder="Enter text"
                />

                {/* Checkboxes for languages */}
                <div>
                    <input
                        type="checkbox"
                        checked={selectedLanguages.includes('spanish')}
                        onChange={() => handleCheckboxChange('spanish')}
                    />
                    <label>Spanish</label>
                </div>
                <div>
                    <input
                        type="checkbox"
                        checked={selectedLanguages.includes('japanese')}
                        onChange={() => handleCheckboxChange('japanese')}
                    />
                    <label>Japanese</label>
                </div>
                <div>
                    <input
                        type="checkbox"
                        checked={selectedLanguages.includes('french')}
                        onChange={() => handleCheckboxChange('french')}
                    />
                    <label>French</label>
                </div>
                <div>
                    <input
                        type="checkbox"
                        checked={selectedLanguages.includes('german')}
                        onChange={() => handleCheckboxChange('german')}
                    />
                    <label>German</label>
                </div>

                {/* Submit button */}
                <button type="submit">Submit</button>
            </form>
            <button type='button' onClick={() => downloadCSV()} >Download Excel</button>

            {/* Display result */}
            {result && <div style={{ marginTop: '20px' }}>{result}</div>}
            <Markdown>{scrapperOutput}</Markdown>
        </div>
    );
};

export default ScrapperV2;