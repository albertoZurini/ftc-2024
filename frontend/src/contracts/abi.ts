
export const CONTRACT_ADDRESS = "0xD525BAdbBD438631CF63A097Ab332302FB0617ca";
export const CONTRACT_ABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "courseAddress",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "contentAddress",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "contentThumbnail",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "contentDescription",
                "type": "string"
            }
        ],
        "name": "ContentAdded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "courseAddress",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "courseThumbnail",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "description",
                "type": "string"
            }
        ],
        "name": "CourseAdded",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "courseAddress",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "courseThumbnail",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "courseDescription",
                "type": "string"
            },
            {
                "internalType": "address[]",
                "name": "contentAddresses",
                "type": "address[]"
            },
            {
                "internalType": "string[]",
                "name": "contentThumbnails",
                "type": "string[]"
            },
            {
                "internalType": "string[]",
                "name": "contentDescriptions",
                "type": "string[]"
            }
        ],
        "name": "addCourseWithContents",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "courseAddress",
                "type": "address"
            }
        ],
        "name": "getAllContents",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "contentAddresses",
                "type": "address[]"
            },
            {
                "internalType": "string[]",
                "name": "thumbnails",
                "type": "string[]"
            },
            {
                "internalType": "string[]",
                "name": "descriptions",
                "type": "string[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAllCourses",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "",
                "type": "address[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "courseAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "contentIndex",
                "type": "uint256"
            }
        ],
        "name": "getContent",
        "outputs": [
            {
                "internalType": "address",
                "name": "contentAddress",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "contentThumbnail",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "contentDescription",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "courseAddress",
                "type": "address"
            }
        ],
        "name": "getCourse",
        "outputs": [
            {
                "internalType": "string",
                "name": "courseThumbnail",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "courseDescription",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "contentCount",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "courseAddress",
                "type": "address"
            }
        ],
        "name": "getCourseOwner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];