import { cn } from "../../lib/utils";

export const BentoGrid = ({
    className,
    children,
}) => {
    return (
        <div
            className={cn(
                "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto",
                className
            )}
        >
            {children}
        </div>
    );
};

export const BentoGridItem = ({
    className,
    title,
    description,
    header,
    icon,
}) => {
    return (
        <div
            className={cn(
                "row-span-1 rounded-xl group/bento hover:shadow-xl transition-all duration-300 shadow-sm p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 justify-between flex flex-col space-y-4 cursor-pointer hover:-translate-y-1",
                className
            )}
        >
            {header}
            <div className="group-hover/bento:translate-x-2 transition duration-200">
                {icon}
                <div className="font-bold text-slate-900 dark:text-white mb-2 mt-2">
                    {title}
                </div>
                <div className="font-normal text-slate-600 dark:text-slate-400 text-xs">
                    {description}
                </div>
            </div>
        </div>
    );
};
