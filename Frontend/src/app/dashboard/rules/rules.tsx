'use client';

import {IconPlus, IconArrowNarrowLeft} from "@tabler/icons-react";
import Modal from "../components/ModalAdd";
import ModalEdit from "../components/ModalEdit";
import { useState } from "react";
import Link from 'next/link';

export default function Rules() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
        <div className='w-full h-screen bg-neutral-900 flex flex-col pt-2 gap-4'>

            {/* Header */}
            <div className='w-auto ml-2 mr-2 bg-neutral-800 p-4 rounded-lg'>

                {/* Zurück zum Dashboard */}
                <div className='flex items-center mb-6'>
                    <Link 
                        href='/dashboard' 
                        className='flex items-center gap-2 bg-neutral-600 text-white px-4 py-2 rounded-full hover:bg-neutral-700 transition-colors min-w-max'>
                        <IconArrowNarrowLeft className='size-4' />
                        <span className='text-sm font-medium'>Zurück zum Dashboard</span>
                    </Link> 
                </div>

                <h1 className='text-3xl font-bold mb-10 text-white'>Regel Verwaltung</h1>

                <p className='text-gray-300 mb-4'>Hier können Sie Ihre Regeln verwalten. Sie können neue Regeln hinzufügen, und durch Auswahl bestehende Regeln bearbeiten oder löschen.</p>

                <h3 className='text-xl font-bold mb-4 text-white'>Regeln Übersicht</h3>
                <p className='text-gray-300 mb-4'>...</p>
            </div>

            {/* Bearbeitung */}

            <div className='flex gap-4 ml-2 mr-2'>
                {/* hinzufügen */}
                    <div className=''>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className='bg-green-400 hover:bg-green-500 text-white py-2 px-4 rounded-full transition-colors'>
                                <IconPlus className='size-5 text-white'/>
                        </button>
                    </div>

                    <Modal isOpen={isModalOpen} onClose={closeModal} />

                {/* Bearbeiten */}
                <div className=''>
                    <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className='bg-blue-400 hover:bg-blue-500 text-white py-2 px-4 rounded-full transition-colors'>
                        Bearbeiten
                    </button>
                </div>

                    <ModalEdit isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />

                {/* Löschen */}
                <div className=''>
                    <button className='bg-red-400 hover:bg-red-500 text-white py-2 px-4 rounded-full transition-colors'>
                        Löschen
                    </button>
                </div>

                {/* Select all */}
                <div className=''>
                    <button className='bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded-full transition-colors'>
                        Select all
                    </button>
                </div>

                {/* Deselect all */}
                <div className=''>
                    <button className='bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded-full transition-colors'>
                        Deselect all
                    </button>
                </div>
            </div>

            {/* Tabelle */}
            <div className='overflow-x-auto flex-items-center justify-center w-auto ml-2 mr-2 bg-neutral-800 p-4 rounded-lg'>
                <table className='w-full text-left text-sm text-gray-300 m-1'>
                    <tr>
                        <th>Select</th>
                        <th>Name</th>
                        <th>Event-Type</th>
                        <th>Severity</th>
                        <th>Enabled</th>
                    </tr>
                    <tr>
                        <td><input type="checkbox" name="select"></input></td>
                        <td>Custom XSS Detection</td>
                        <td>xss</td>
                        <td>medium</td>
                        <td><input type="checkbox" name="enabled" checked></input></td>
                    </tr>
                    <tr>
                        <td><input type="checkbox" name="select"></input></td>
                        <td>...</td>
                        <td>...</td>
                        <td>...</td>
                        <td><input type="checkbox" name="enabled"></input></td>
                    </tr>
                </table>
            </div>

            
        </div>
        </>
    );
}