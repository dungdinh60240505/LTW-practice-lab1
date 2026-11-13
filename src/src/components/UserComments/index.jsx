import React, { useEffect, useState } from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import { Link, useParams } from "react-router-dom";

import "./styles.css";
import fetchModel, { formatDate, imageUrl } from "../../lib/fetchModelData";

/**
 * Define UserComments (extra credit).
 * Shows all comments authored by a user. Each comment shows a thumbnail of
 * the photo it was made on; clicking it opens the photo's detail view.
 */
function UserComments() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setUser(null);
    setComments(null);
    setError(null);
    Promise.all([
      fetchModel(`/user/${userId}`),
      fetchModel(`/commentsOfUser/${userId}`),
    ])
      .then(([u, c]) => {
        setUser(u);
        setComments(c);
      })
      .catch((err) => setError(err.message));
  }, [userId]);

  if (error) {
    return <Typography color="error">Cannot load comments: {error}</Typography>;
  }
  if (!comments || !user) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <div>
      <Typography variant="h5" className="user-comments-title">
        Comments of {user.first_name} {user.last_name} ({comments.length})
      </Typography>
      {comments.length === 0 && (
        <Typography>This user has not written any comments.</Typography>
      )}
      {comments.map((c) => (
        <Card key={c._id} variant="outlined" className="user-comment-card">
          <CardActionArea
            component={Link}
            to={`/photos/${c.photo.user_id}/${c.photo._id}`}
            className="user-comment-action"
          >
            <CardMedia
              component="img"
              image={imageUrl(c.photo.file_name)}
              alt={c.photo.file_name}
              className="user-comment-thumb"
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {formatDate(c.date_time)}
              </Typography>
              <Typography variant="body1">{c.comment}</Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </div>
  );
}

export default UserComments;

