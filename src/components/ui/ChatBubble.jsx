const ChatBubble = ({ message, isOwn, senderName, timestamp }) => {
  const time = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`} style={{ marginBottom: '12px' }}>
      <div style={{
        maxWidth: '70%',
        padding: '10px 16px',
        borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isOwn ? 'var(--gradient-purple)' : 'var(--bg-elevated)',
        color: isOwn ? '#fff' : 'var(--text-primary)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        {senderName && (
          <div className="font-bold text-xs mb-1" style={{ color: 'var(--brand-primary)', opacity: isOwn ? 0.9 : 1 }}>
            {senderName}
          </div>
        )}
        <p style={{ fontSize: '0.875rem', lineHeight: 1.6, margin: 0, wordBreak: 'break-word' }}>{message}</p>
        {time && (
          <div className="text-right mt-1" style={{ fontSize: '0.65rem', opacity: 0.6 }}>
            {time}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
