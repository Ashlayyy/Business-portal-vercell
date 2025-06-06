'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '../../../utils/firebase.browser';
import { useAuth } from '@/context/AuthContext';
import styles from './sidebar.module.scss';

import { usePathname, useSearchParams } from 'next/navigation';

type SidebarProps = {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	isAdmin: boolean;
	onClick?: () => void;
};

type SidebarItemProps = {
	href: string;
	label: string;
	onClick?: () => void;
};

const Sidebar = ({ isOpen, setIsOpen, isAdmin }: SidebarProps) => {
	const { user } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const isLoggedIn = user !== null;

	const shouldShowNavigation = ['/', '/activities', '/events'].includes(
		pathname
	);

	const handleLogout = async () => {
		try {
			await signOut(auth);
			await auth.signOut();
			await fetch('/api/auth/logout', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			setIsProfileOpen(false);
			router.push('/login');
		} catch (error) {
			console.error('Error logging out:', error);
		}
	};

	return (
		<>
			<header
				className={`${styles.header} ${
					isOpen ? styles['header--shifted'] : ''
				}`}
			>
				<div className={styles.header__container}>
					<nav className={styles.header__nav}>
						<div className={styles.header__left}>
							{isAdmin && (
								<button
									className={`${styles.toggleButton} ${
										isOpen ? styles['toggleButton--hidden'] : ''
									}`}
									onClick={() => {
										setIsOpen(!isOpen);
										if (isProfileOpen) setIsProfileOpen(false);
									}}
								>
									{isOpen ? (
										<i className="fa-solid fa-x"></i>
									) : (
										<i className="fa-solid fa-bars"></i>
									)}
								</button>
							)}
						</div>

						<div className={styles.header__center}>
							{isLoggedIn && shouldShowNavigation && (
								<ul
									className={`${styles.header__navList} ${styles['header__navList--first']}`}
								>
									<HeaderItem href="/" label="All" />
									<HeaderItem href="/activities" label="Activities" />
									<HeaderItem href="/events" label="Events" />
								</ul>
							)}
						</div>

						<div className={styles.header__right}>
							{isLoggedIn && (
								<ul className={styles.header__navList}>
									<li className={`${styles.profileDropdownContainer}`}>
										<button
											className={styles.profileButton}
											onClick={() => {
												setIsProfileOpen(!isProfileOpen);
												if (isOpen) {
													setIsOpen(false);
												}
											}}
										>
											<i className="fas fa-user-circle"></i>
										</button>

										{isProfileOpen && (
											<div className={styles.profileDropdown}>
												<Link
													href="/profile"
													onClick={() => setIsProfileOpen(false)}
												>
													Profile
												</Link>
												{isAdmin && (
													<Link
														href="/settings"
														onClick={() => setIsProfileOpen(false)}
													>
														Settings
													</Link>
												)}
												<button onClick={handleLogout}>Logout</button>
											</div>
										)}
									</li>
								</ul>
							)}
						</div>
					</nav>
				</div>
			</header>

			{isAdmin && (
				<div
					className={`${styles.sidebar} ${
						isOpen ? styles['sidebar--open'] : ''
					}`}
				>
					<div className={styles.sidebar__container}>
						<button
							className={styles.toggleButton}
							onClick={() => setIsOpen(!isOpen)}
						>
							{isOpen ? (
								<i className="fa-solid fa-x"></i>
							) : (
								<i className="fa-solid fa-bars"></i>
							)}
						</button>
					</div>
					<nav className={styles.sidebar__nav}>
						<ul className={styles.sidebar__navList}>
							<h2 className={styles.sidebar__title}>Homepage</h2>
							<SidebarItem
								onClick={() => setIsOpen(false)}
								href="/"
								label="All"
							/>
						</ul>

						<ul className={styles.sidebar__navList}>
							<h2 className={styles.sidebar__title}>Admin</h2>
							<SidebarItem
								onClick={() => setIsOpen(false)}
								href="/companies"
								label="Companies"
							/>
							<SidebarItem
								onClick={() => setIsOpen(false)}
								href="/activities/approve"
								label="Pending Activities"
							/>
						</ul>
					</nav>
				</div>
			)}
		</>
	);
};

const SidebarItem = ({ href, label, onClick }: SidebarItemProps) => {
	const pathname = usePathname();
	const isActive = pathname === href;

	return (
		<li className={styles.sidebar__navItem} onClick={onClick}>
			<Link
				href={href}
				className={
					isActive ? styles.sidebar__activeLink : styles.sidebar__navLink
				}
			>
				{label}
			</Link>
		</li>
	);
};

const HeaderItem = ({ href, label }: { href: string; label: string }) => {
	const pathname = usePathname();

	// Header navigation should only care about pathname, not query parameters
	const isActive = pathname === href;

	return (
		<li className={styles.header__navItem}>
			<Link
				href={href}
				className={
					isActive ? styles.sidebar__activeLink : styles.sidebar__navLink
				}
			>
				{label}
			</Link>
		</li>
	);
};
export default Sidebar;
