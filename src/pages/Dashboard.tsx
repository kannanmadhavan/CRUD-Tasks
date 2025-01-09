import React from "react";
import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
  return (
    <div>
      <style>
        {`
          .dashboard-container {
            display: flex;
            justify-content: center; /* Center horizontally */
            align-items: center; /* Center vertically */
            height: 100vh; /* Full viewport height */
            text-align: center; /* Center text */
          }
        `}
      </style>

      <div className="container-fluid dashboard-container">
        <div>
          <h2>Welcome to your Dashboard</h2>
          <p>This is where you can manage your tasks.</p>
          <Link to="/create-task">
          <button className="btn btn-success">Create a New Task</button>
        </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
