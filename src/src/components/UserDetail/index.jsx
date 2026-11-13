import React, { useEffect, useState } from "react";
import { Button, Divider, Typography } from "@mui/material";
import { Link, useParams } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

/**
 * Define UserDetail, a React component of Project 4.
 * Shows the details of the user given by the userId route parameter.
 */
function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setUser(null);
    setError(null);
    fetchModel(`/user/${userId}`)
      .then(setUser)
      .catch((err) => setError(err.message));
  }, [userId]);

  if (error) {
    return <Typography color="error">Cannot load user: {error}</Typography>;
  }
  if (!user) {
    return <Typography>Loading...</Typography>;
  }

  return (
        <div className="user-detail">
          <Typography variant="h5">
            {user.first_name} {user.last_name}
          </Typography>
        <Divider className="user-detail-divider" />
        <Typography variant="body1" className="user-detail-row">
          <b>Location:</b> {user.location}
        </Typography>
        <Typography variant="body1" className="user-detail-row">
          <b>Occupation:</b> {user.occupation}
        </Typography>
        <Typography variant="body1" className="user-detail-row">
          <b>Description:</b> {user.description}
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to={`/photos/${user._id}`}
          className="user-detail-button"
        >
          View photos
        </Button>
      </div>
      );
}

      export default UserDetail;
