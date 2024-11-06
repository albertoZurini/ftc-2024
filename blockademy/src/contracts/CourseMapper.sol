// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract CourseContentStorage {
    struct Content {
        address contentAddress;  // Address related to the content
        string thumbnail;  // IPFS address of the content thumbnail
        string description; // Description of the content
    }

    struct Course {
        string courseThumbnail;  // IPFS address of the course thumbnail
        string description; // Description of the Course
        Content[] contents;      // Array of contents (each with address, thumbnail, and description)
    }

    // Mapping from the course address to the Course data
    mapping(address => Course) private courses;

    // Array to store all course addresses
    address[] private courseAddresses;

    // Event emitted when a course is added or updated
    event CourseAdded(address indexed courseAddress, string courseThumbnail, string description);

    // Event emitted when content is added to a course
    event ContentAdded(address indexed courseAddress, address contentAddress, string contentThumbnail, string contentDescription);

    /**
     * @dev Add or update a course with a thumbnail and contents.
     * @param courseAddress The address of the course.
     * @param courseThumbnail The IPFS address of the course thumbnail.
     * @param courseDescription The description of the course.
     * @param contentAddresses The array of addresses related to each content.
     * @param contentThumbnails The array of IPFS addresses of the content thumbnails.
     * @param contentDescriptions The array of descriptions for the contents.
     */
    function addCourseWithContents(
        address courseAddress,
        string memory courseThumbnail,
        string memory courseDescription,
        address[] memory contentAddresses,
        string[] memory contentThumbnails,
        string[] memory contentDescriptions
    ) public {
        require(contentAddresses.length == contentThumbnails.length, "Addresses and thumbnails length mismatch");
        require(contentThumbnails.length == contentDescriptions.length, "Thumbnails and descriptions length mismatch");

        // Add or update the course
        Course storage course = courses[courseAddress];
        course.courseThumbnail = courseThumbnail;
        course.description = courseDescription;

        // Clear existing contents for the course (if any) before adding new ones
        delete course.contents;

        // Add each content to the course
        for (uint256 i = 0; i < contentThumbnails.length; i++) {
            course.contents.push(Content({
                contentAddress: contentAddresses[i],
                thumbnail: contentThumbnails[i],
                description: contentDescriptions[i]
            }));
            emit ContentAdded(courseAddress, contentAddresses[i], contentThumbnails[i], contentDescriptions[i]);
        }

        // Add course address to the courseAddresses array only if it is not already added
        bool exists = false;
        for (uint256 i = 0; i < courseAddresses.length; i++) {
            if (courseAddresses[i] == courseAddress) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            courseAddresses.push(courseAddress);
        }

        emit CourseAdded(courseAddress, courseThumbnail, courseDescription);
    }

    /**
     * @dev Get the course thumbnail and the number of contents.
     * @param courseAddress The address of the course.
     * @return courseThumbnail The IPFS address of the course thumbnail.
     * @return courseDescription The description of the course.
     * @return contentCount The number of contents in the course.
     */
    function getCourse(address courseAddress) external view returns (string memory courseThumbnail, string memory courseDescription, uint256 contentCount) {
        Course storage course = courses[courseAddress];
        return (course.courseThumbnail, course.description, course.contents.length);
    }

    /**
     * @dev Get a specific content of a course.
     * @param courseAddress The address of the course.
     * @param contentIndex The index of the content to retrieve.
     * @return contentAddress The address of the content.
     * @return contentThumbnail The IPFS address of the content thumbnail.
     * @return contentDescription The description of the content.
     */
    function getContent(address courseAddress, uint256 contentIndex)
        external
        view
        returns (address contentAddress, string memory contentThumbnail, string memory contentDescription)
    {
        Course storage course = courses[courseAddress];
        require(contentIndex < course.contents.length, "Content index out of bounds");
        Content storage content = course.contents[contentIndex];
        return (content.contentAddress, content.thumbnail, content.description);
    }

    /**
     * @dev Get all the contents of a course.
     * @param courseAddress The address of the course.
     * @return contentAddresses An array of content addresses.
     * @return thumbnails An array of IPFS addresses of the content thumbnails.
     * @return descriptions An array of descriptions for the contents.
     */
    function getAllContents(address courseAddress)
        external
        view
        returns (address[] memory contentAddresses, string[] memory thumbnails, string[] memory descriptions)
    {
        Course storage course = courses[courseAddress];
        uint256 contentCount = course.contents.length;

        contentAddresses = new address[](contentCount);
        thumbnails = new string[](contentCount);
        descriptions = new string[](contentCount);

        for (uint256 i = 0; i < contentCount; i++) {
            contentAddresses[i] = course.contents[i].contentAddress;
            thumbnails[i] = course.contents[i].thumbnail;
            descriptions[i] = course.contents[i].description;
        }

        return (contentAddresses, thumbnails, descriptions);
    }

    /**
     * @dev Get all course addresses.
     * @return An array of all course addresses.
     */
    function getAllCourses() external view returns (address[] memory) {
        return courseAddresses;
    }
}
