import React from "react";

const SubscriptionCard = ({ title, content }) => {
  return (
    <div className="subscription-card">
      <div className="subscription-card-content">
        <div className="subscription-label">{title}</div>
        <div className="subscription-details">{content}</div>
      </div>
    </div>
  );
};

export default SubscriptionCard;
