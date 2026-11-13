import React, { useEffect, useState } from "react";
import {
  Chip,
  Divider,
  List,
  ListItem,
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
 * Extra credit: each user has a green bubble (number of photos) and a red
 * bubble (number of comments, clickable -> comments view).
 */
function UserList() {
  const [users, setUsers] = useState([]);
  const [counts, setCounts] = useState({});
  const [error, setError] = useState(null);

  // Highlight the user currently shown in the content area.
  const detailMatch = useMatch("/users/:userId");
  const photosMatch = useMatch("/photos/:userId/*");
  const commentsMatch = useMatch("/comments/:userId");
  const selectedId = (detailMatch || photosMatch || commentsMatch)?.params
    .userId;

  useEffect(() => {
    fetchModel("/user/list")
      .then(setUsers)
      .catch((err) => setError(err.message));
    fetchModel("/user/counts")
      .then(setCounts)
      .catch(() => setCounts({}));
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
        {users.map((user) => {
          const c = counts[user._id];
          return (
            <React.Fragment key={user._id}>
              <ListItem disablePadding className="userlist-item">
                <ListItemButton
                  component={Link}
                  to={`/users/${user._id}`}
                  selected={user._id === selectedId}
                >
                  <ListItemText
                    primary={`${user.first_name} ${user.last_name}`}
                  />
                </ListItemButton>
                {c && (
                  <div className="userlist-bubbles">
                    <Chip
                      size="small"
                      label={c.photo_count}
                      title="Number of photos"
                      className="userlist-bubble userlist-bubble-photos"
                    />
                    <Chip
                      size="small"
                      label={c.comment_count}
                      title="Number of comments - click to view"
                      component={Link}
                      to={`/comments/${user._id}`}
                      clickable
                      className="userlist-bubble userlist-bubble-comments"
                    />
                  </div>
                )}
              </ListItem>
              <Divider />
            </React.Fragment>
          );
        })}
      </List>
    </div>
  );
}

export default UserList;
