import React, { useEffect, useState } from "react";
import Accordion from "react-bootstrap/Accordion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faShare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Modal, Button, Form } from "react-bootstrap";
import envVariables from "../../../importenv";
import { content } from "../../model/content.model";
// import { v4 as uuidv4 } from "uuid";
import { ObjectId } from "mongodb";
import { course } from "../../model/course.model";

function ProfContent() {
  const [contentList, setContentList] = useState<content[]>([]);
  const [courses, setCourses] = useState<course[]>([]);

  const [show, setShow] = useState(false);
  const [newContent, setNewContent] = useState<content>({
    // Change the property name to _id
    courseID: "",
    title: "",
    description: "",
  });

  const [editedContent, setEditedContent] = useState<content>({
    courseID: "",
    title: "",
    description: "",
  });

  // State to control the edit modal
  const [showEditModal, setShowEditModal] = useState(false);

  // State to hold the ID of the content to be updated
  const [updateContentId, setUpdateContentId] = useState<string | null>(null);

  // State to control the confirmation modal for delete
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteContentId, setDeleteContentId] = useState<ObjectId | undefined>(
    undefined
  );
  const [selectedCourseID, setSelectedCourseID] = useState<string | undefined>(
    undefined
  ); // State to store selected courseID
  const [createSelectedCourseId, setCreatedSelectedCourseID] = useState<string | undefined>(
    undefined
  ); // State to store selected courseID

  const mongoURI = envVariables.mongoURI;
  const backendURL = envVariables.backendURL;

  useEffect(() => {
    fetchContent();
    fetchCourses();
  }, []);

  const fetchContent = () => {
    fetchContentFromBackend().then((contentList) => {
      setContentList(contentList);
    });
  };
  //update content
  // Handler for opening the edit modal
  const handleEditClick = (contentId?: ObjectId) => {
    // Find the content with the provided _id
    const contentToEdit = contentList.find(
      (content) => content._id === contentId
    );
    if (contentToEdit) {
      setEditedContent(contentToEdit);
      setShowEditModal(true);
    }
  };
  const fetchCourses = async () => {
    try {
      const response = await fetch(`${backendURL}/get-courses`);
      const data = await response.json();

      if (response.ok) {
        setCourses(data.courseList);
      } else {
        console.log("Failed to fetch courses.");
      }
    } catch (error) {
      console.error(error);
      console.log("An error occurred while fetching courses.");
    }
  };

  const handleCourseSelectionChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedCourseID(event.target.value);
  };
  const createHandleCourseSelectionChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setCreatedSelectedCourseID(event.target.value);
    setNewContent({
      ...newContent,
      courseID: event.target.value,
    })
  };

  // Extract unique courseIDs from the courses fetched from the backend
  const uniqueCourseIDs = Array.from(
    new Set(courses.map((course) => course.courseID))
  );
  // Handler for updating the content
  const handleEditSubmit = async () => {
    if (editedContent._id) {
      const backendURL = envVariables.backendURL;
      try {
        const response = await fetch(
          `${backendURL}/update-content/${editedContent._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(editedContent),
          }
        );

        if (response.ok) {
          fetchContent(); // Fetch updated content list after editing
          setShowEditModal(false); // Hide the edit modal
          setEditedContent({ courseID: "", title: "", description: "" }); // Reset editedContent
        } else {
          console.error("Failed to update content.");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };
  //fetch content
  function fetchContentFromBackend(): Promise<content[]> {
    return fetch(`${backendURL}/get-content`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.contentList)) {
          return data.contentList as content[];
        } else {
          return [];
        }
      })
      .catch((error) => {
        console.error(error);
        return [];
      });
  }

  const addContentToBackend = async (content: content) => {
    const backendURL = envVariables.backendURL;

    // Generate a UUID for _id

    try {
      const response = await fetch(`${backendURL}/create-content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(content), // Send the content with the generated _id
      });

      if (response.ok) {
        fetchContent();
        setShow(false);
        setNewContent({ courseID: "", title: "", description: "" }); // Reset other fields, excluding _id
      } else {
        console.error("Failed to add content to the backend.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    addContentToBackend(newContent);
  };

  // Handler for opening the delete confirmation modal
  const handleDeleteClick = (contentId?: ObjectId) => {
    // Set the ID of the content to be deleted
    setDeleteContentId(contentId);
    setShowDeleteConfirmation(true); // Show the delete confirmation modal
  };

  // Handler for deleting the content
  const handleDeleteConfirm = async () => {
    // Check if there's a content ID to delete
    if (deleteContentId) {
      const backendURL = envVariables.backendURL;
      try {
        const response = await fetch(
          `${backendURL}/delete-content/${deleteContentId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          fetchContent(); // Fetch updated content list after deletion
          setShowDeleteConfirmation(false); // Hide the delete confirmation modal
          setDeleteContentId(undefined); // Reset the content ID to delete
        } else {
          console.error("Failed to delete content.");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div style={{ marginLeft: "10%", marginRight: "10%" }}>
      <div className="Headers">Content</div>
      <Button onClick={() => setShow(true)}>Create Content</Button>
      {/* Dropdown for courseIDs */}
      <Form.Select
        value={selectedCourseID}
        onChange={handleCourseSelectionChange}
        className="mt-4"
      >
        <option value="">Select a Course ID</option> {/* Placeholder option */}
        {uniqueCourseIDs.map((courseID) => (
          <option key={courseID} value={courseID}>
            {courseID}
          </option>
        ))}
      </Form.Select>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Content</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleFormSubmit}>
            <Form.Group className="mb-3" controlId="formCourseID">
              <Form.Label>Course ID</Form.Label>
              <Form.Select
                value={createSelectedCourseId}
                onChange={createHandleCourseSelectionChange}
                className="mt-4"
              >
                <option value="">Select a Course ID</option>{" "}
                {/* Placeholder option */}
                {uniqueCourseIDs.map((courseID) => (
                  <option key={courseID} value={courseID}>
                    {courseID}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Title"
                value={newContent.title}
                onChange={(e) =>
                  setNewContent({
                    ...newContent,
                    title: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter Description"
                value={newContent.description}
                onChange={(e) =>
                  setNewContent({
                    ...newContent,
                    description: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShow(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* edit modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Content</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Form.Group className="mb-3" controlId="formCourseID"></Form.Group>
            <Form.Group className="mb-3" controlId="formTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Title"
                value={editedContent.title}
                onChange={(e) =>
                  setEditedContent({
                    ...editedContent,
                    title: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter Description"
                value={editedContent.description}
                onChange={(e) =>
                  setEditedContent({
                    ...editedContent,
                    description: e.target.value,
                  })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditSubmit}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>
      {/* delete confirmation modal */}
      <Modal
        show={showDeleteConfirmation}
        onHide={() => setShowDeleteConfirmation(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this content?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirmation(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      <Accordion className="mt-5">
        {contentList.length > 0 ? (
          contentList
            .filter((content) => content.courseID === selectedCourseID) // Filter contents by selectedCourseID
            .map((content, index) => (
              <Accordion.Item eventKey={index.toString()} key={index}>
                <Accordion.Header>
                  <div
                    className="d-flex justify-content-between"
                    style={{ width: "100%" }}
                  >
                    <div>{content.title}</div>

                    <div className="me-2">
                      {/* Edit button */}
                      <FontAwesomeIcon
                        icon={faEdit}
                        style={{ cursor: "pointer", marginRight: "10px" }}
                        onClick={() => handleEditClick(content._id)}
                      />
                      {/* Delete button */}
                      <FontAwesomeIcon
                        icon={faTrash}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleDeleteClick(content._id)}
                      />
                    </div>
                  </div>
                </Accordion.Header>
                <Accordion.Body className="d-flex flex-column align-items-start">
                  <h3>{content.title}</h3>
                  <p>{content.description}</p>
                  {/* ... (rest of the content rendering) */}
                </Accordion.Body>
              </Accordion.Item>
            ))
        ) : (
          <div>No content found.</div>
        )}
      </Accordion>
    </div>
  );
}

export default ProfContent;
