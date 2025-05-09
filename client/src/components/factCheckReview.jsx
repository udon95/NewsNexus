import React, { useState } from 'react';

const FactCheckReview = ({ 
  accuracy, 
  feedback, 
  onApprove, 
  onRequestRecheck,
  onCancel,
  isLoading
}) => {
  const [userFeedback, setUserFeedback] = useState('');
  
  // Function to safely parse and display HTML content with highlights
  const displayHtmlContent = (htmlContent) => {
    if (!htmlContent) return null;
    
    // Extract highlighted parts for explanation
    const explanations = [];
    let i = 0;
    
    // Try to find the Article part in the feedback
    const articlePart = htmlContent.includes('Article:') 
      ? htmlContent.split('Article:')[1].split('Explanation:')[0].trim()
      : htmlContent;
      
    const explanationPart = htmlContent.includes('Explanation:') 
      ? htmlContent.split('Explanation:')[1].trim()
      : '';
      
    return (
      <div className="fact-check-content">
        <div className="article-preview" dangerouslySetInnerHTML={{ __html: articlePart }} />
        
        {explanationPart && (
          <div className="explanations">
            <h4>Explanation of Highlighted Issues:</h4>
            <p>{explanationPart}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fact-check-review">
      <div className="review-header">
        <h3>Fact Check Results</h3>
        <div className="accuracy-score">
          <div className={`score ${accuracy >= 90 ? 'high' : accuracy >= 75 ? 'medium' : 'low'}`}>
            {accuracy}%
          </div>
          <div className="accuracy-label">Accuracy</div>
        </div>
      </div>

      <div className="review-content">
        <div className="highlighted-content">
          <h4>Review Highlighted Issues:</h4>
          {displayHtmlContent(feedback)}
        </div>

        <div className="user-feedback">
          <h4>Don't agree with the fact check?</h4>
          <p>Provide your feedback below and request a re-check:</p>
          <textarea
            value={userFeedback}
            onChange={(e) => setUserFeedback(e.target.value)}
            placeholder="Explain why you disagree with the fact check or provide additional context..."
            rows={4}
            className="feedback-textarea"
          />
        </div>
      </div>

      <div className="review-actions">
        <button 
          onClick={() => onCancel()} 
          className="cancel-button"
          disabled={isLoading}
        >
          Cancel
        </button>
        
        <button 
          onClick={() => onRequestRecheck(userFeedback)} 
          className="recheck-button"
          disabled={!userFeedback.trim() || isLoading}
        >
          {isLoading ? 'Processing...' : 'Request Re-check'}
        </button>
        
        <button 
          onClick={() => onApprove()} 
          className="approve-button"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Approve & Publish'}
        </button>
      </div>
    </div>
  );
};

export default FactCheckReview;