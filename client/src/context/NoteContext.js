'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const NoteContext = createContext();

export const NoteProvider = ({ children }) => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState({}); // { subjectId: [topics] }
  const [subtopics, setSubtopics] = useState({}); // { topicId: [subtopics] }
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load all subjects on mount
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await api.get('/subjects');
      setSubjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchTopics = async (subjectId) => {
    try {
      const data = await api.get(`/topics/subject/${subjectId}`);
      setTopics((prev) => ({ ...prev, [subjectId]: data }));
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchSubtopics = async (topicId) => {
    try {
      const data = await api.get(`/subtopics/topic/${topicId}`);
      setSubtopics((prev) => ({ ...prev, [topicId]: data }));
    } catch (err) {
      setError(err.message);
    }
  };

  // Slug-based dynamic detail getters
  const fetchSubjectBySlug = async (slug) => {
    try {
      setLoading(true);
      const data = await api.get(`/subjects/slug/${slug}`);
      return data; // { subject, topics }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchTopicBySlug = async (slug) => {
    try {
      setLoading(true);
      const data = await api.get(`/topics/${slug}`);
      return data; // { topic, subtopics }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchSubtopicBySlug = async (slug) => {
    try {
      setLoading(true);
      const data = await api.get(`/subtopics/${slug}`);
      setSelectedSubtopic(data);
      return data; // subtopic details + qas
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadSubtopicDetails = async (subtopicId) => {
    try {
      setLoading(true);
      const data = await api.get(`/subtopics/${subtopicId}`);
      setSelectedSubtopic(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createSubject = async (name, description = '', isPublic = true) => {
    try {
      const data = await api.post('/subjects', { name, description, isPublic });
      setSubjects((prev) => [...prev, data]);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateSubject = async (id, name, description = '', isPublic = true) => {
    try {
      const data = await api.put(`/subjects/${id}`, { name, description, isPublic });
      setSubjects((prev) => prev.map((s) => (s._id === id ? data : s)));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteSubject = async (id) => {
    try {
      await api.delete(`/subjects/${id}`);
      setSubjects((prev) => prev.filter((s) => s._id !== id));
      setTopics((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      if (selectedSubtopic && selectedSubtopic.topic?.subject?._id === id) {
        setSelectedSubtopic(null);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const createTopic = async (title, subjectId, description = '', content = '', order = 0) => {
    try {
      const data = await api.post('/topics', { title, subject: subjectId, description, content, order });
      setTopics((prev) => ({
        ...prev,
        [subjectId]: [...(prev[subjectId] || []), data],
      }));
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateTopic = async (id, subjectId, updateData) => {
    try {
      const data = await api.put(`/topics/${id}`, updateData);
      setTopics((prev) => ({
        ...prev,
        [subjectId]: (prev[subjectId] || []).map((t) => (t._id === id ? data : t)),
      }));
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteTopic = async (id, subjectId) => {
    try {
      await api.delete(`/topics/${id}`);
      setTopics((prev) => ({
        ...prev,
        [subjectId]: (prev[subjectId] || []).filter((t) => t._id !== id),
      }));
      setSubtopics((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      if (selectedSubtopic && selectedSubtopic.topic?._id === id) {
        setSelectedSubtopic(null);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const createSubtopic = async (title, topicId, content = '', order = 0) => {
    try {
      const data = await api.post('/subtopics', { title, topic: topicId, content, order });
      setSubtopics((prev) => ({
        ...prev,
        [topicId]: [...(prev[topicId] || []), data],
      }));
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateSubtopic = async (id, topicId, updateData) => {
    try {
      const data = await api.put(`/subtopics/${id}`, updateData);

      // Update in subtopics list
      setSubtopics((prev) => ({
        ...prev,
        [topicId]: (prev[topicId] || []).map((st) => (st._id === id ? data : st)),
      }));

      // Update active subtopic state
      if (selectedSubtopic && selectedSubtopic._id === id) {
        setSelectedSubtopic(data);
      }
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteSubtopic = async (id, topicId) => {
    try {
      await api.delete(`/subtopics/${id}`);
      setSubtopics((prev) => ({
        ...prev,
        [topicId]: (prev[topicId] || []).filter((st) => st._id !== id),
      }));
      if (selectedSubtopic && selectedSubtopic._id === id) {
        setSelectedSubtopic(null);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Standalone Q&A CRUD Methods
  const createQa = async (question, answer, subtopicId, topicId = null, tags = [], order = 0) => {
    try {
      const data = await api.post('/qna', { question, answer, subtopic: subtopicId, topic: topicId, tags, order });

      // Update local selectedSubtopic state with new Q&A
      if (selectedSubtopic && selectedSubtopic._id === subtopicId) {
        setSelectedSubtopic((prev) => ({
          ...prev,
          qas: [...(prev.qas || []), data],
        }));
      }

      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateQa = async (qaId, subtopicId, updateData) => {
    try {
      const data = await api.put(`/qna/${qaId}`, updateData);

      // Update in selectedSubtopic
      if (selectedSubtopic && selectedSubtopic._id === subtopicId) {
        setSelectedSubtopic((prev) => ({
          ...prev,
          qas: (prev.qas || []).map((q) => (q._id === qaId ? data : q)),
        }));
      }

      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteQa = async (qaId, subtopicId) => {
    try {
      await api.delete(`/qna/${qaId}`);

      // Remove from selectedSubtopic
      if (selectedSubtopic && selectedSubtopic._id === subtopicId) {
        setSelectedSubtopic((prev) => ({
          ...prev,
          qas: (prev.qas || []).filter((q) => q._id !== qaId),
        }));
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return (
    <NoteContext.Provider
      value={{
        subjects,
        topics,
        subtopics,
        selectedSubtopic,
        loading,
        error,
        fetchSubjects,
        fetchTopics,
        fetchSubtopics,
        fetchSubjectBySlug,
        fetchTopicBySlug,
        fetchSubtopicBySlug,
        loadSubtopicDetails,
        createSubject,
        updateSubject,
        deleteSubject,
        createTopic,
        updateTopic,
        deleteTopic,
        createSubtopic,
        updateSubtopic,
        deleteSubtopic,
        createQa,
        updateQa,
        deleteQa,
        setSelectedSubtopic,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
};
