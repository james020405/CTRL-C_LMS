import { cn } from "../../lib/utils";
import { Link, useLocation } from "react-router-dom";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
};

export const SidebarProvider = ({
    children,
    open: openProp,
    setOpen: setOpenProp,
    animate = true,
}) => {
    const [openState, setOpenState] = useState(false);

    const open = openProp !== undefined ? openProp : openState;
    const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

    return (
        <SidebarContext.Provider value={{ open, setOpen, animate }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const Sidebar = ({
    children,
    open,
    setOpen,
    animate,
}) => {
    return (
        <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
            {children}
        </SidebarProvider>
    );
};

export const SidebarBody = (props) => {
    return (
        <>
            <DesktopSidebar {...props} />
            <MobileSidebar {...props} />
        </>
    );
};

export const DesktopSidebar = ({
    className,
    children,
    ...props
}) => {
    const { open, setOpen, animate } = useSidebar();
    return (
        <motion.div
            className={cn(
                "h-full px-4 py-4 hidden md:flex md:flex-col bg-slate-100 dark:bg-slate-800 w-[220px] flex-shrink-0",
                className
            )}
            animate={{
                width: animate ? (open ? "220px" : "60px") : "220px",
            }}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={(e) => {
                // Only close if leaving towards the content (right) or significantly outside
                if (e.clientX > 10) {
                    setOpen(false);
                }
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export const MobileSidebar = ({
    className,
    children,
    ...props
}) => {
    const { open, setOpen } = useSidebar();
    return (
        <>
            <div
                className={cn(
                    "h-10 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-slate-100 dark:bg-slate-800 w-full"
                )}
                {...props}
            >
                <div className="flex justify-end z-20 w-full">
                    <Menu
                        className="text-slate-800 dark:text-slate-200 cursor-pointer"
                        onClick={() => setOpen(!open)}
                    />
                </div>
                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ x: "-100%", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "-100%", opacity: 0 }}
                            transition={{
                                duration: 0.3,
                                ease: "easeInOut",
                            }}
                            className={cn(
                                "fixed h-full w-full inset-0 bg-white dark:bg-slate-900 p-10 z-[100] flex flex-col justify-between",
                                className
                            )}
                        >
                            <div
                                className="absolute right-10 top-10 z-50 text-slate-800 dark:text-slate-200 cursor-pointer"
                                onClick={() => setOpen(!open)}
                            >
                                <X />
                            </div>
                            {children}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export const SidebarLink = ({
    link,
    className,
    ...props
}) => {
    const { open, animate, setOpen } = useSidebar();
    const location = useLocation();
    const isActive = location.pathname === link.href;

    // Close mobile sidebar when navigating
    const handleClick = () => {
        // Only close on mobile (when sidebar is fullscreen overlay)
        if (window.innerWidth < 768) {
            setOpen(false);
        }
    };

    return (
        <Link
            to={link.href}
            onClick={handleClick}
            className={cn(
                "flex items-center justify-start gap-2 group/sidebar py-2 px-2 rounded-lg transition-all overflow-visible",
                isActive
                    ? "bg-blue-100 dark:bg-blue-900/40"
                    : "hover:bg-slate-200/50 dark:hover:bg-slate-700/50",
                className
            )}
            {...props}
        >
            <div className={cn(
                "flex-shrink-0",
                isActive && "relative before:absolute before:-left-4 before:top-0 before:bottom-0 before:w-1 before:bg-blue-500 before:rounded-full"
            )}>
                {React.cloneElement(link.icon, {
                    className: cn(
                        link.icon.props.className,
                        isActive && "text-blue-600 dark:text-blue-400"
                    )
                })}
            </div>
            <motion.span
                animate={{
                    display: animate ? (open ? "inline-block" : "none") : "inline-block",
                    opacity: animate ? (open ? 1 : 0) : 1,
                }}
                className={cn(
                    "text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0",
                    isActive
                        ? "text-blue-700 dark:text-blue-300 font-medium"
                        : "text-slate-700 dark:text-slate-200"
                )}
            >
                {link.label}
            </motion.span>
        </Link>
    );
};
