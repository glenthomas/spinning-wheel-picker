// Canvas setup
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spinButton');
const updateButton = document.getElementById('updateButton');
const namesInput = document.getElementById('namesInput');

// Modal elements
const modal = document.getElementById('resultModal');
const modalResult = document.getElementById('modalResult');
const closeModal = document.getElementById('closeModal');
const spinAgainBtn = document.getElementById('spinAgainBtn');

const dynaPuffFont = new FontFace(
  "DynaPuff",
  "url(https://fonts.gstatic.com/s/dynapuff/v9/z7NKdRvsZDIVHbYPMhZJ3HQ83UaSu4uhr7-zGcLpaJ-Y0A.woff2)"
);

// Set canvas size
canvas.width = 600;
canvas.height = 600;

// Default names
let names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];

// Wheel state
let rotation = 0;
let angularVelocity = 0;
let isSpinning = false;
let targetRotation = 0;

// Colors for wheel segments
const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#FF8A80', '#82B1FF', '#B9F6CA', '#FFD180'
];

// Load names from textarea
function loadNames() {
  const text = namesInput.value.trim();
  if (text) {
    names = text.split('\n').map(name => name.trim()).filter(name => name.length > 0);
    if (names.length < 2) {
      names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];
      alert('Please enter at least 2 names!');
      namesInput.value = names.join('\n');
    } else {
      // Save to localStorage
      localStorage.setItem('wheelNames', namesInput.value);
    }
  }
  drawWheel();
}

// Initialize with saved names or default names
const savedNames = localStorage.getItem('wheelNames');
if (savedNames) {
  namesInput.value = savedNames;
  names = savedNames.split('\n').map(name => name.trim()).filter(name => name.length > 0);
} else {
  namesInput.value = names.join('\n');
}

// Draw the wheel
function drawWheel() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 20;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw wheel shadow
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.arc(centerX + 5, centerY + 5, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  // Calculate angle for each segment
  const anglePerSegment = (Math.PI * 2) / names.length;
  
  // Draw segments
  for (let i = 0; i < names.length; i++) {
    const startAngle = rotation + (i * anglePerSegment);
    const endAngle = startAngle + anglePerSegment;
    
    // Draw segment
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    
    // Fill with color
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    
    // Add border
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw text
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + anglePerSegment / 2);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.font = 'bold 26px DynaPuff';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 4;
    
    // Adjust text position based on radius
    const textRadius = radius - 30;
    ctx.strokeText(names[i], textRadius, 0);
    ctx.fillText(names[i], textRadius, 0);
    ctx.restore();
    ctx.restore();
  }
  
  // Draw center circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
  ctx.fillStyle = '#333';
  ctx.fill();
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Draw center dot
  ctx.beginPath();
  ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#FFD700';
  ctx.fill();
  ctx.restore();
  
  // Draw pointer (triangle at top)
  drawPointer(centerX, centerY, radius);
}

// Draw the pointer
function drawPointer(centerX, centerY, radius) {
  ctx.save();
  ctx.translate(centerX, centerY - radius - 10);
  
  // Pointer shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.moveTo(2, 2);
  ctx.lineTo(-22, -32);
  ctx.lineTo(22, -32);
  ctx.closePath();
  ctx.fill();
  
  // Pointer
  ctx.fillStyle = '#FF0000';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-20, -30);
  ctx.lineTo(20, -30);
  ctx.closePath();
  ctx.fill();
  
  // Pointer outline
  ctx.strokeStyle = '#990000';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Pointer highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-10, -15);
  ctx.lineTo(10, -15);
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
}

// Get the winning segment
function getWinningSegment() {
  const anglePerSegment = (Math.PI * 2) / names.length;
  
  // The pointer is at the top, pointing down into the wheel
  // In canvas coordinates, that's -π/2 (or 3π/2)
  // We need to find which segment is at that position
  
  // Normalize rotation to 0-2π
  let normalizedRotation = ((rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  
  // The pointer is at the top center, which is at angle 3π/2 (270 degrees)
  // relative to the standard canvas coordinate system
  const pointerAngle = (Math.PI * 3) / 2;
  
  // Calculate which segment the pointer is pointing at
  // We subtract the rotation to account for wheel spinning
  let targetAngle = (pointerAngle - normalizedRotation + Math.PI * 2) % (Math.PI * 2);
  
  // Find the segment index
  let segmentIndex = Math.floor(targetAngle / anglePerSegment);
  
  // Make sure index is within bounds
  segmentIndex = segmentIndex % names.length;
  
  return names[segmentIndex];
}

// Animation loop
function animate() {
  if (isSpinning) {
    // Update rotation
    rotation += angularVelocity;
    
    // Apply deceleration - slower deceleration for longer spin
    angularVelocity *= 0.992;
    
    // Stop when velocity is very low
    if (Math.abs(angularVelocity) < 0.001) {
      isSpinning = false;
      angularVelocity = 0;
      spinButton.disabled = false;
      updateButton.disabled = false;
      
      // Show winner in modal
      const winner = getWinningSegment();
      setTimeout(() => {
        showResultModal(winner);
      }, 100);
    }
    
    drawWheel();
    requestAnimationFrame(animate);
  }
}

// Spin the wheel
function spin() {
  if (isSpinning) return;
  
  // Set initial velocity - higher for longer spin
  angularVelocity = 0.5 + Math.random() * 0.15;
  
  // Add extra spins (between 8 and 12 full rotations)
  const extraSpins = 8 + Math.random() * 4;
  angularVelocity += extraSpins * 0.05;
  
  isSpinning = true;
  spinButton.disabled = true;
  updateButton.disabled = true;

  animate();
}

// Modal functions
function showResultModal(winner) {
  modalResult.textContent = winner;
  modal.classList.add('show');
  // Prevent body scrolling when modal is open
  document.body.style.overflow = 'hidden';
}

function hideResultModal() {
  modal.classList.remove('show');
  // Restore body scrolling
  document.body.style.overflow = '';
}

// Event listeners
spinButton.addEventListener('click', spin);
updateButton.addEventListener('click', () => {
  loadNames();
});

// Modal event listeners
closeModal.addEventListener('click', hideResultModal);
spinAgainBtn.addEventListener('click', () => {
  hideResultModal();
  // Small delay to allow modal to close before spinning
  setTimeout(() => {
    spin();
  }, 100);
});

// Close modal when clicking outside of it
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    hideResultModal();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('show')) {
    hideResultModal();
  }
});

dynaPuffFont.load().then((font) => {
  document.fonts.add(font);
    // Initial draw
    drawWheel();
});
