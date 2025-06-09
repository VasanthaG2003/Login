import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Spinner from './Spinner';

interface User {
  id: number;
  name: string;
  email: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    const auth = localStorage.getItem('isLoggedIn');
    if (auth !== 'true') {
      navigate('/');
    }
  }, [navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://jsonplaceholder.typicode.com/users`);
      // Simulate pagination by slicing
      const newUsers = response.data.slice((page - 1) * 10, page * 10);
      setUsers((prev) => [...prev, ...newUsers]);
    } catch (error) {
      console.error("Error fetching users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const lastUserRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          setPage(prev => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading]
  );

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>User List</h2>
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
      </div>

      <div className="list-group">
        {users.map((user, index) => (
          <div
            key={user.id}
            className="list-group-item list-group-item-action"
            ref={index === users.length - 1 ? lastUserRef : null}
          >
            <strong>{user.name}</strong> — {user.email}
          </div>
        ))}
      </div>

      {loading && <Spinner />}
    </div>
  );
};

export default UserList;
