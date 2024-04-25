"use strict";
/// <reference path="../csgo.d.ts" />
var Scheduler;
(function (Scheduler) {
    const oJobs = {};
    function Schedule(delay, fn, key = 'default') {
        if (!oJobs.hasOwnProperty(key))
            oJobs[key] = [];
        oJobs[key].push(Job(delay, fn, key));
    }
    Scheduler.Schedule = Schedule;
    function Cancel(key = 'default') {
        if (oJobs.hasOwnProperty(key)) {
            while (oJobs[key].length) {
                const job = oJobs[key].pop();
                job.Cancel();
            }
        }
    }
    Scheduler.Cancel = Cancel;
    function Job(delay, func, key) {
        let m_handle = $.Schedule(delay, function () {
            m_handle = null;
            func();
        });
        return {
            GetHandle: () => m_handle,
            Cancel: () => {
                if (m_handle) {
                    $.CancelScheduled(m_handle);
                    m_handle = null;
                }
            },
        };
    }
})(Scheduler || (Scheduler = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZWR1bGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vY29udGVudC9jc2dvL3Bhbm9yYW1hL3NjcmlwdHMvY29tbW9uL3NjaGVkdWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEscUNBQXFDO0FBZXJDLElBQVUsU0FBUyxDQXdEbEI7QUF4REQsV0FBVSxTQUFTO0lBU2xCLE1BQU0sS0FBSyxHQUEwQixFQUFFLENBQUM7SUFFeEMsU0FBZ0IsUUFBUSxDQUFHLEtBQWEsRUFBRSxFQUFjLEVBQUUsTUFBYyxTQUFTO1FBRWhGLElBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFFLEdBQUcsQ0FBRTtZQUNoQyxLQUFLLENBQUUsR0FBRyxDQUFFLEdBQUcsRUFBRSxDQUFDO1FBRW5CLEtBQUssQ0FBRSxHQUFHLENBQUUsQ0FBQyxJQUFJLENBQUUsR0FBRyxDQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFFLENBQUUsQ0FBQztJQUM1QyxDQUFDO0lBTmUsa0JBQVEsV0FNdkIsQ0FBQTtJQUVELFNBQWdCLE1BQU0sQ0FBRyxNQUFjLFNBQVM7UUFFL0MsSUFBSyxLQUFLLENBQUMsY0FBYyxDQUFFLEdBQUcsQ0FBRSxFQUNoQztZQUNDLE9BQVEsS0FBSyxDQUFFLEdBQUcsQ0FBRSxDQUFDLE1BQU0sRUFDM0I7Z0JBQ0MsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFFLEdBQUcsQ0FBRSxDQUFDLEdBQUcsRUFBRyxDQUFDO2dCQUNoQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDYjtTQUNEO0lBQ0YsQ0FBQztJQVZlLGdCQUFNLFNBVXJCLENBQUE7SUFFRCxTQUFTLEdBQUcsQ0FBRyxLQUFhLEVBQUUsSUFBZ0IsRUFBRSxHQUFXO1FBRTFELElBQUksUUFBUSxHQUFrQixDQUFDLENBQUMsUUFBUSxDQUFFLEtBQUssRUFBRTtZQUVoRCxRQUFRLEdBQUcsSUFBSSxDQUFDO1lBQ2hCLElBQUksRUFBRSxDQUFDO1FBR1IsQ0FBQyxDQUFFLENBQUM7UUFJSixPQUFPO1lBQ04sU0FBUyxFQUFFLEdBQUcsRUFBRSxDQUFDLFFBQVE7WUFDekIsTUFBTSxFQUFFLEdBQUcsRUFBRTtnQkFFWixJQUFLLFFBQVEsRUFDYjtvQkFFQyxDQUFDLENBQUMsZUFBZSxDQUFFLFFBQVEsQ0FBRSxDQUFDO29CQUM5QixRQUFRLEdBQUcsSUFBSSxDQUFDO2lCQUNoQjtZQUNGLENBQUM7U0FDRCxDQUFDO0lBQ0gsQ0FBQztBQUNGLENBQUMsRUF4RFMsU0FBUyxLQUFULFNBQVMsUUF3RGxCIn0=