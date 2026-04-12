import React, { useState, useMemo } from 'react';
import {
  FiCheckSquare, FiClock, FiAlertCircle, FiCircle, FiCheckCircle,
  FiMessageSquare, FiFilter, FiSearch, FiCalendar, FiUser,
  FiArrowRight, FiMoreVertical, FiPaperclip, FiPlus, FiEye,
  FiPlay, FiPause, FiXCircle, FiTag
} from 'react-icons/fi';
import VoiceSearchInput from '../../components/common/VoiceSearchInput';

const TASK_STATUSES = {
  TODO: { label: 'To Do', color: 'gray', icon: FiCircle, textClass: 'text-gray-500', badgeClass: 'badge-gray' },
  IN_PROGRESS: { label: 'In Progress', color: 'blue', icon: FiPlay, textClass: 'text-blue-500', badgeClass: 'badge-info' },
  IN_REVIEW: { label: 'In Review', color: 'amber', icon: FiPause, textClass: 'text-amber-500', badgeClass: 'badge-warning' },
  DONE: { label: 'Done', color: 'green', icon: FiCheckCircle, textClass: 'text-green-500', badgeClass: 'badge-success' },
  BLOCKED: { label: 'Blocked', color: 'red', icon: FiXCircle, textClass: 'text-red-500', badgeClass: 'badge-danger' },
};

const TASK_PRIORITIES = {
  CRITICAL: { label: 'Critical', color: 'red', bgMutedClass: 'bg-red-100', textClass: 'text-red-700', bgClass: 'bg-red-500' },
  HIGH: { label: 'High', color: 'orange', bgMutedClass: 'bg-orange-100', textClass: 'text-orange-700', bgClass: 'bg-orange-500' },
  MEDIUM: { label: 'Medium', color: 'yellow', bgMutedClass: 'bg-yellow-100', textClass: 'text-yellow-700', bgClass: 'bg-yellow-500' },
  LOW: { label: 'Low', color: 'gray', bgMutedClass: 'bg-gray-100', textClass: 'text-gray-700', bgClass: 'bg-gray-500' },
};

const MyTask = () => {
  const [activeView, setActiveView] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [selectedTask, setSelectedTask] = useState(null);
  const [newComment, setNewComment] = useState('');

  const [tasks] = useState([
    {
      id: 'TASK-001',
      title: 'Verify stock count for Cipla sub-station',
      description: 'Perform a physical count of all items at the Cipla sub-station and reconcile with the system inventory. Report any discrepancies.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assignee: 'Rajesh Kumar',
      assignedBy: 'Vikram Singh',
      createdAt: '2026-03-22 09:00 AM',
      updatedAt: '2026-03-24 02:30 PM',
      dueDate: '2026-03-26',
      tags: ['stock', 'inventory', 'ciple'],
      comments: [
        { id: 'C1', author: 'Vikram Singh', role: 'MANAGEMENT', text: 'Please complete this before end of week. We need accurate numbers for the monthly report.', createdAt: '2026-03-22 09:05 AM' },
        { id: 'C2', author: 'Rajesh Kumar', role: 'STAFF', text: 'Started counting Zone B items. Will update by tomorrow.', createdAt: '2026-03-23 11:00 AM' },
      ],
    },
    {
      id: 'TASK-002',
      title: 'Process pending orders from MedPlus Pharmacy',
      description: 'There are 5 pending orders from MedPlus that need to be processed. Check stock availability and prepare for dispatch.',
      status: 'TODO',
      priority: 'CRITICAL',
      assignee: 'Rajesh Kumar',
      assignedBy: 'Vikram Singh',
      createdAt: '2026-03-24 08:00 AM',
      updatedAt: '2026-03-24 08:00 AM',
      dueDate: '2026-03-25',
      tags: ['orders', 'dispatch', 'urgent'],
      comments: [
        { id: 'C3', author: 'Vikram Singh', role: 'MANAGEMENT', text: 'MedPlus is a priority client. Handle these first thing today.', createdAt: '2026-03-24 08:05 AM' },
      ],
    },
    {
      id: 'TASK-003',
      title: 'Update barcode labels for new batch',
      description: 'Generate and print new barcode labels for the incoming batch from Sun Pharma. Apply to all items before shelving.',
      status: 'DONE',
      priority: 'MEDIUM',
      assignee: 'Rajesh Kumar',
      assignedBy: 'Vikram Singh',
      createdAt: '2026-03-20 10:00 AM',
      updatedAt: '2026-03-21 04:00 PM',
      dueDate: '2026-03-22',
      tags: ['barcode', 'sun-pharma'],
      comments: [
        { id: 'C4', author: 'Rajesh Kumar', role: 'STAFF', text: 'All 120 labels printed and applied. Ready for shelving.', createdAt: '2026-03-21 04:00 PM' },
        { id: 'C5', author: 'Vikram Singh', role: 'MANAGEMENT', text: 'Good work! Verified the labels.', createdAt: '2026-03-21 05:00 PM' },
      ],
    },
    {
      id: 'TASK-004',
      title: 'Clean and organize Zone A shelves',
      description: 'Deep clean all shelves in Zone A. Reorganize items by expiry date (FIFO). Remove any expired products.',
      status: 'IN_REVIEW',
      priority: 'LOW',
      assignee: 'Rajesh Kumar',
      assignedBy: 'Vikram Singh',
      createdAt: '2026-03-19 09:00 AM',
      updatedAt: '2026-03-23 03:00 PM',
      dueDate: '2026-03-28',
      tags: ['maintenance', 'organization'],
      comments: [
        { id: 'C6', author: 'Rajesh Kumar', role: 'STAFF', text: 'Zone A cleaning completed. Found 3 expired items - moved to quarantine.', createdAt: '2026-03-23 03:00 PM' },
      ],
    },
    {
      id: 'TASK-005',
      title: 'Follow up on pending payments',
      description: 'Contact overdue accounts and send payment reminders. Focus on accounts overdue by more than 7 days.',
      status: 'BLOCKED',
      priority: 'HIGH',
      assignee: 'Rajesh Kumar',
      assignedBy: 'Vikram Singh',
      createdAt: '2026-03-23 02:00 PM',
      updatedAt: '2026-03-24 10:00 AM',
      dueDate: '2026-03-25',
      tags: ['payments', 'follow-up'],
      comments: [
        { id: 'C7', author: 'Vikram Singh', role: 'MANAGEMENT', text: 'Phone system is down. Waiting for IT to fix before making calls.', createdAt: '2026-03-24 10:00 AM' },
      ],
    },
  ]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = !searchQuery ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = filterStatus === 'ALL' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'ALL' || task.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, filterStatus, filterPriority]);

  const taskStats = useMemo(() => ({
    todo: tasks.filter((t) => t.status === 'TODO').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    inReview: tasks.filter((t) => t.status === 'IN_REVIEW').length,
    done: tasks.filter((t) => t.status === 'DONE').length,
    blocked: tasks.filter((t) => t.status === 'BLOCKED').length,
    total: tasks.length,
  }), [tasks]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)}d overdue`;
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return `${diff}d left`;
  };

  const isOverdue = (dateStr) => {
    const date = new Date(dateStr);
    return date < new Date() && dateStr < new Date().toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tasks assigned by your manager</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('list')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeView === 'list' ? 'bg-primary-100 text-primary-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setActiveView('board')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeView === 'board' ? 'bg-primary-100 text-primary-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            Board
          </button>
        </div>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(TASK_STATUSES).map(([key, config]) => {
          const StatusIcon = config.icon;
          return (
          <button
            key={key}
            onClick={() => setFilterStatus(filterStatus === key ? 'ALL' : key)}
            className={`card hover:ring-2 transition-all cursor-pointer ${
              filterStatus === key ? 'ring-2 ring-primary-300' : ''
            }`}
          >
            <div className="card-body py-3">
              <div className="flex items-center gap-2">
                <StatusIcon className={`w-4 h-4 ${config.textClass}`} />
                <span className="text-sm font-medium text-gray-700">{config.label}</span>
              </div>
              <p className="text-xl font-bold text-gray-900 mt-1">{taskStats[key.toLowerCase().replace('_', '')] || 0}</p>
            </div>
          </button>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <VoiceSearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={(val) => setSearchQuery(val)}
            placeholder="Search tasks by title, ID, or tags..."
            inputWidth="w-full"
          />
        </div>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          <option value="ALL">All Priorities</option>
          {Object.entries(TASK_PRIORITIES).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
      </div>

      {/* List View */}
      {activeView === 'list' && (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="card p-8 text-center">
              <FiCheckSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400">No tasks found</p>
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setFilterStatus('ALL'); setFilterPriority('ALL'); }}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : filteredTasks.map((task) => {
            const TaskStatusIcon = TASK_STATUSES[task.status].icon;
            const taskElement = (
              <div
                key={task.id}
                onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                className={`card cursor-pointer hover:ring-2 hover:ring-primary-200 transition-all ${
                  selectedTask?.id === task.id ? 'ring-2 ring-primary-300' : ''
                }`}
              >
                <div className="card-body">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <TaskStatusIcon className={`w-5 h-5 mt-0.5 ${TASK_STATUSES[task.status].textClass}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-gray-400">{task.id}</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${TASK_PRIORITIES[task.priority].bgMutedClass} ${TASK_PRIORITIES[task.priority].textClass}`}>
                            {TASK_PRIORITIES[task.priority].label}
                          </span>
                          <span className={`badge ${TASK_STATUSES[task.status].badgeClass}`}>
                            {TASK_STATUSES[task.status].label}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 mt-1">{task.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{task.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`text-xs flex items-center gap-1 ${
                            isOverdue(task.dueDate) ? 'text-red-600 font-medium' : 'text-gray-400'
                          }`}>
                            <FiCalendar className="w-3 h-3" />
                            {formatDate(task.dueDate)}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <FiUser className="w-3 h-3" />
                            From: {task.assignedBy}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <FiMessageSquare className="w-3 h-3" />
                            {task.comments.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                          {task.tags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded: Comments */}
                  {selectedTask?.id === task.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Comments ({task.comments.length})</h4>
                      <div className="space-y-3 mb-4">
                        {task.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                              comment.role === 'MANAGEMENT' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                              {comment.author.charAt(0)}
                            </div>
                            <div className="flex-1 bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-900">{comment.author}</span>
                                <span className="text-xs text-gray-400">{comment.createdAt}</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{comment.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="input-field flex-1"
                        />
                        <button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
            return taskElement;
          })}
        </div>
      )}

      {/* Board View (Kanban) */}
      {activeView === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto">
          {Object.entries(TASK_STATUSES).map(([key, config]) => {
            const columnTasks = filteredTasks.filter((t) => t.status === key);
            const BoardIcon = config.icon;
            return (
              <div key={key} className="min-w-[250px]">
                <div className="flex items-center gap-2 mb-3">
                  <BoardIcon className={`w-4 h-4 ${config.textClass}`} />
                  <span className="text-sm font-semibold text-gray-700">{config.label}</span>
                  <span className="ml-auto text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                    {columnTasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="card p-3 cursor-pointer hover:ring-2 hover:ring-primary-200 transition-all"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`w-2 h-2 rounded-full ${TASK_PRIORITIES[task.priority].bgClass}`} />
                        <span className="text-xs font-medium text-gray-500">{task.priority}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{task.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs ${isOverdue(task.dueDate) ? 'text-red-500' : 'text-gray-400'}`}>
                          {formatDate(task.dueDate)}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-0.5">
                          <FiMessageSquare className="w-3 h-3" />
                          {task.comments.length}
                        </span>
                      </div>
                    </div>
                  ))}
                  {columnTasks.length === 0 && (
                    <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg text-center">
                      <p className="text-xs text-gray-400">No tasks</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && activeView === 'board' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-400">{selectedTask.id}</span>
                <span className={`badge ${TASK_STATUSES[selectedTask.status].badgeClass}`}>
                  {TASK_STATUSES[selectedTask.status].label}
                </span>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${TASK_PRIORITIES[selectedTask.priority].bgMutedClass} ${TASK_PRIORITIES[selectedTask.priority].textClass}`}>
                  {TASK_PRIORITIES[selectedTask.priority].label}
                </span>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{selectedTask.title}</h2>
            <p className="text-sm text-gray-600">{selectedTask.description}</p>
            <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Assigned By</p>
                <p className="text-sm font-medium text-gray-900">{selectedTask.assignedBy}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Due Date</p>
                <p className={`text-sm font-medium ${isOverdue(selectedTask.dueDate) ? 'text-red-600' : 'text-gray-900'}`}>
                  {selectedTask.dueDate}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-sm text-gray-700">{selectedTask.createdAt}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Last Updated</p>
                <p className="text-sm text-gray-700">{selectedTask.updatedAt}</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Comments ({selectedTask.comments.length})</h4>
              <div className="space-y-3">
                {selectedTask.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      comment.role === 'MANAGEMENT' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {comment.author.charAt(0)}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-900">{comment.author}</span>
                        <span className="text-xs text-gray-400">{comment.createdAt}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="input-field flex-1"
              />
              <button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTask;
