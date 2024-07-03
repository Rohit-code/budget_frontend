// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
// import AddProjectPage from './pages/AddProjectPage';
// import ProjectDetailPage from './pages/ProjectDetailPage';
// import SummaryPage from './pages/SummaryPage';
// import Login from './components/Login';
// import Register from './components/Register';
// import './App.css';
// import axios from 'axios';

// function App() {
//   const [projects, setProjects] = useState([]);

//   useEffect(() => {
//     const fetchProjects = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/projects');
//         setProjects(response.data);
//       } catch (error) {
//         console.error('Error fetching projects:', error);
//       }
//     };

//     fetchProjects();
//   }, []);

//   const handleProjectAdded = (newProject) => {
//     setProjects(prevProjects => [...prevProjects, newProject]);
//   };

//   const handleDeleteProject = async (projectId) => {
//     try {
//       await axios.delete(`http://localhost:5000/projects/${projectId}`);
//       setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
//     } catch (error) {
//       console.error('Error deleting project:', error);
//     }
//   };

//   return (
//     <Router>
//       <div className="App">
//         <h1>Project Budget Management System</h1>
//         <nav>
//           <ul>
//             <li><Link to="/add-project">Add Project</Link></li>
//             <li><Link to="/summary">Summary</Link></li>
//             {/* <li><Link to="/login">Login</Link></li>
//             <li><Link to="/register">Register</Link></li> */}
//             <li>
//               <select onChange={(e) => {
//                 const projectId = e.target.value;
//                 if (projectId) {
//                   window.location.href = `/project/${projectId}`;
//                 }
//               }}>
//                 <option value="">Select a project</option>
//                 {projects.map(project => (
//                   <option key={project.id} value={project.id}>{project.name}</option>
//                 ))}
//               </select>
//             </li>
//           </ul>
//         </nav>
//         <Routes>
//           <Route path="/add-project" element={<AddProjectPage onProjectAdded={handleProjectAdded} />} />
//           <Route path="/summary" element={<SummaryPage />} />
//           <Route path="/project/:projectId" element={<ProjectDetailPage onDeleteProject={handleDeleteProject} />} />
//           {/* <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} /> */}
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;
// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Link } from 'react-router-dom';
// import axios from 'axios';
// import PublicRoutes from './routes/PublicRoutes';
// import PrivateRoutes from './routes/PrivateRoutes';
// import './App.css';

// function App() {
//   const [projects, setProjects] = useState([]);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
//     if (isAuthenticated) {
//       const fetchProjects = async () => {
//         try {
//           const response = await axios.get('http://localhost:5000/projects');
//           setProjects(response.data);
//         } catch (error) {
//           console.error('Error fetching projects:', error);
//         }
//       };

//       fetchProjects();
//     }
//   }, [isAuthenticated]);

//   const handleProjectAdded = (newProject) => {
//     setProjects(prevProjects => [...prevProjects, newProject]);
//   };

//   const handleDeleteProject = async (projectId) => {
//     try {
//       await axios.delete(`http://localhost:5000/projects/${projectId}`);
//       setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
//     } catch (error) {
//       console.error('Error deleting project:', error);
//     }
//   };

//   const handleLogin = () => {
//     setIsAuthenticated(true);
//   };

//   const handleLogout = () => {
//     setIsAuthenticated(false);
//   };

//   return (
//     <Router>
//       <div className="App">
//         <h1>Project Budget Management System</h1>
//         {isAuthenticated ? (
//           <>
//             <nav>
//               <ul>
//                 <li><Link to="/add-project">Add Project</Link></li>
//                 <li><Link to="/summary">Summary</Link></li>
//                 <li><button onClick={handleLogout}>Logout</button></li>
//                 <li>
//                   <select onChange={(e) => {
//                     const projectId = e.target.value;
//                     if (projectId) {
//                       window.location.href = `/project/${projectId}`;
//                     }
//                   }}>
//                     <option value="">Select a project</option>
//                     {projects.map(project => (
//                       <option key={project.id} value={project.id}>{project.name}</option>
//                     ))}
//                   </select>
//                 </li>
//               </ul>
//             </nav>
//             <PrivateRoutes handleProjectAdded={handleProjectAdded} handleDeleteProject={handleDeleteProject} />
//           </>
//         ) : (
//           <PublicRoutes handleLogin={handleLogin} />
//         )}
//       </div>
//     </Router>
//   );
// }

// export default App;
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import PublicRoutes from './routes/PublicRoutes';
import PrivateRoutes from './routes/PrivateRoutes';
import './App.css';

function App() {
  const [projects, setProjects] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:5000/checkAuth', { withCredentials: true });
        setIsAuthenticated(response.data.isAuthenticated);
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchProjects = async () => {
        try {
          const response = await axios.get('http://localhost:5000/projects');
          setProjects(response.data);
        } catch (error) {
          console.error('Error fetching projects:', error);
        }
      };

      fetchProjects();
    }
  }, [isAuthenticated]);

  const handleProjectAdded = (newProject) => {
    setProjects(prevProjects => [...prevProjects, newProject]);
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await axios.delete(`http://localhost:5000/projects/${projectId}`);
      setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/logout', {}, { withCredentials: true });
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Router>
      <div className="App">
        <h1>Project Budget Management System</h1>
        {isAuthenticated ? (
          <>
            <nav>
              <ul>
                <li><Link to="/add-project">Add Project</Link></li>
                <li><Link to="/summary">Summary</Link></li>
                <li>
                  <select onChange={(e) => {
                    const projectId = e.target.value;
                    if (projectId) {
                      window.location.href = `/project/${projectId}`;
                    }
                  }}>
                    <option value="">Select a project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </li>
                <li><button onClick={handleLogout}>Logout</button></li>
                
              </ul>
            </nav>
            <PrivateRoutes handleProjectAdded={handleProjectAdded} handleDeleteProject={handleDeleteProject} />
          </>
        ) : (
          <PublicRoutes handleLogin={handleLogin} />
        )}
      </div>
    </Router>
  );
}

export default App;
