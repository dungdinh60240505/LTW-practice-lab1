import React, { useEffect, useState } from "react";
import {
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { Link, useMatch } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

/**
 * Define UserList, a React component of Project 4.
 * Shows the names of all users; clicking a name opens that user's details.
 */
function UserList() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  // Highlight the user currently shown in the content area.
  const detailMatch = useMatch("/users/:userId");
  const photosMatch = useMatch("/photos/:userId/*");
  const selectedId = (detailMatch || photosMatch)?.params.userId;

  useEffect(() => {
    fetchModel("/user/list")
      .then(setUsers)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <Typography color="error">Cannot load users: {error}</Typography>;
  }

  return (
    <div>
        <Typography variant="h6" className="userlist-title">
          Users
        </Typography>
        <List component="nav">
              {users.map((user) => (
                <React.Fragment key={user._id}>
                  <ListItemButton
                    component={Link}
                    to={`/users/${user._id}`}
                    selected={user._id === selectedId}
                  >
                    <ListItemText primary={`${user.first_name} ${user.last_name}`} />
                  </ListItemButton>
                  <Divider />
            </React.Fragment >
          ))}
        </List>
    </div>
  );
}

export default UserList;
