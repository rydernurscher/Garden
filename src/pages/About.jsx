// src/pages/About.jsx
import React from 'react';
import '../styles/styles.css';

export default function About({ session }) {
  const user = session.user;
  const usernameDisplay =
    user.user_metadata?.full_name ||
    user.email.substring(0, user.email.indexOf('@'));

  return (
    <div className="about-page" style={{ padding: '1rem 0' }}>
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <h2>About Garden Planner</h2>
        <p>Welcome <strong>{usernameDisplay}</strong>! This guide will help you navigate and get the most out of the Garden Planner app.</p>

        <h3>1. Dashboard</h3>
        <p>
          The Dashboard is your home screen after logging in. Here you’ll see:
        </p>
        <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
          <li>
            <strong>Plants in Library:</strong> The total number of plants you’ve added to your personal library. Click “View Library” to jump to that section.
          </li>
          <li>
            <strong>Total Tasks:</strong> A count of all upcoming gardening tasks (watering, pruning, fertilizing, etc.). Click “View Planner” to manage your tasks.
          </li>
          <li>
            <strong>Recently Added Plants:</strong> Thumbnails of your three most recently added plants. Click any plant in the Plant Library to update its notes or upload a photo.
          </li>
          <li>
            <strong>Upcoming Tasks:</strong> A quick list of your next three tasks, showing the task type, associated plant (if any), and due date.
          </li>
          <li>
            <strong>Quick Links:</strong> Buttons at the bottom let you immediately navigate to “Manage Plants” or “Manage Tasks.”
          </li>
        </ul>

        <h3>2. Plant Library</h3>
        <p>
          Navigate to <strong>Plant Library</strong> from the sidebar to add, view, and maintain your plant collection:
        </p>
        <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
          <li>
            <strong>Add a New Plant:</strong> Type the common name (e.g., “Tomato,” “Basil,” “Rose”) into the input and click “Add Plant.” Your plant appears immediately in the grid below.
          </li>
          <li>
            <strong>Upload a Photo:</strong> Click “Upload” on any plant card to select an image from your device. The app stores it in Supabase Storage and displays it as that plant’s thumbnail.
          </li>
          <li>
            <strong>Add Notes:</strong> Under each plant, there’s a “Notes” box. Click inside and type care instructions, planting date, or any other details—your notes will auto-save when you click away.
          </li>
          <li>
            <strong>Remove a Plant:</strong> Click “Remove” on the plant card. You’ll see a confirmation dialog (“Delete ‘Tomato’? This action cannot be undone.”). Confirm to permanently delete that plant (and its photo).
          </li>
        </ul>

        <h3>3. Planner (Tasks)</h3>
        <p>
          In <strong>Planner</strong>, you can create, view, and delete gardening tasks:
        </p>
        <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
          <li>
            <strong>Attach to Plant (Optional):</strong> Use the dropdown to link a task to one of your saved plants (e.g., “Water Tomato”). If no plant is selected, it’s treated as a general task.
          </li>
          <li>
            <strong>Select Task Type:</strong> Choose from “Water,” “Prune,” “Fertilize,” “Harvest,” or “Other.”  
          </li>
          <li>
            <strong>Choose a Due Date:</strong> Pick a date in the future for when you want to complete this task.
          </li>
          <li>
            <strong>Create Task:</strong> Click “Create Task.” Your task appears below in a card that shows the type, associated plant (if any), and due date.
          </li>
          <li>
            <strong>Delete a Task:</strong> Click “Delete” on any task card. A confirmation prompt appears (“Delete this task?”). Confirm to remove it from your planner.
          </li>
        </ul>

        <h3>4. Community Forum</h3>
        <p>
          The <strong>Community Forum</strong> lets you share your plant photos and captions with other users:
        </p>
        <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
          <li>
            <strong>Upload a Photo:</strong> Click “Choose File” and select an image from your device.
          </li>
          <li>
            <strong>Write a Caption:</strong> Type a short description or story about your plant (care tips, growth updates, or fun anecdotes).
          </li>
          <li>
            <strong>Post to Forum:</strong> Click “Post to Forum.” Your image and caption are shared for all users to see. Newest posts appear at the top.
          </li>
          <li>
            <strong>Browse Others’ Posts:</strong> Scroll through the grid of posts to see what other gardeners have shared. Each post shows the photo, caption, username, and the date/time it was posted.
          </li>
        </ul>

        <h3>5. Profile & Settings</h3>
        <p>
          In <strong>Profile</strong>, you can manage your personal details and app settings:
        </p>
        <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
          <li>
            <strong>Email:</strong> This is read-only and shows the email address you registered with.
          </li>
          <li>
            <strong>Full Name:</strong> Enter or update your name. This appears in the Community Forum as your username.
          </li>
          <li>
            <strong>Avatar URL:</strong> Paste a link to any image (e.g., a photo of your favorite plant). This image will be shown as a circular avatar at the top of your Profile page.
          </li>
          <li>
            <strong>Save Changes:</strong> Click this button to save your name and avatar. You’ll receive a confirmation in a browser alert once it’s successful.
          </li>
          <li>
            <strong>Dark Mode Toggle:</strong> Use this button to switch between Light and Dark Mode. Your preference is saved so the app remembers your choice next time you log in.
          </li>
        </ul>

        <h3>6. Dark / Light Mode</h3>
        <p>
          You can toggle Dark Mode on or off by going to your Profile page. In Dark Mode, backgrounds become deep olive‐green, text turns light khaki, and cards adopt a darker green shade—perfect for cozy nighttime browsing!
        </p>

        <h3>7. Logging Out</h3>
        <p>
          Whenever you’re done, click “Logout” at the bottom of the sidebar to end your session. You’ll be redirected to the Login page. To log in again later, simply enter your credentials.
        </p>

        <h3>8. Tips & Best Practices</h3>
        <ul style={{ marginLeft: '1.5rem', marginBottom: '0' }}>
          <li>
            <strong>Organize Your Garden:</strong> Use the Plant Library notes field to track planting dates and care instructions. Refer back to these when scheduling tasks in the Planner.
          </li>
          <li>
            <strong>Stay on Schedule:</strong> Check the Dashboard regularly to see which tasks are coming due soon. Mark tasks as complete or delete them once done.
          </li>
          <li>
            <strong>Share & Learn:</strong> In the Community Forum, you can both inspire others by posting progress photos and learn new tips from fellow gardeners. Don’t be shy—share your successes and challenges alike!
          </li>
          <li>
            <strong>Use Responsive Layout:</strong> The app is designed to work on both desktop and tablet. If you shrink your browser window, grid layouts will adapt so you can still manage plants and tasks on smaller screens.
          </li>
        </ul>
      </div>
    </div>
  );
}
